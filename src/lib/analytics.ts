/**
 * CHED MED — Admin analytics (server-side).
 * Admins have full RLS visibility, so we aggregate over all orders in TS.
 * For very large datasets, move these aggregations into SQL views/RPCs later.
 */
import { listOrders, listDrivers } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types/database";

export interface AnalyticsSummary {
  total: number;
  delivered: number;
  failed: number;
  active: number;          // assigned + picked_up + in_transit
  pending: number;
  completionRate: number;  // delivered / (delivered + failed)
  byStatus: Record<OrderStatus, number>;
  byZone: { zone: string; total: number; delivered: number }[];
  byDriver: { driver: string; total: number; delivered: number }[];
}

const ACTIVE: OrderStatus[] = ["assigned", "picked_up", "in_transit"];

function emptyStatusMap(): Record<OrderStatus, number> {
  return {
    pending: 0,
    assigned: 0,
    picked_up: 0,
    in_transit: 0,
    delivered: 0,
    failed: 0,
    cancelled: 0,
  };
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  const [orders, drivers] = await Promise.all([listOrders(), listDrivers()]);

  const byStatus = emptyStatusMap();
  for (const o of orders) byStatus[o.status]++;

  const delivered = byStatus.delivered;
  const failed = byStatus.failed;
  const active = ACTIVE.reduce((sum, s) => sum + byStatus[s], 0);
  const denom = delivered + failed;

  // Zone breakdown.
  const zoneMap = new Map<string, { total: number; delivered: number }>();
  for (const o of orders) {
    const zone = o.neighborhood || "Unzoned";
    const z = zoneMap.get(zone) ?? { total: 0, delivered: 0 };
    z.total++;
    if (o.status === "delivered") z.delivered++;
    zoneMap.set(zone, z);
  }

  // Driver breakdown (name lookup; orders with no driver are skipped).
  const driverName = new Map(drivers.map((d) => [d.id, d.name || d.id.slice(0, 8)]));
  const driverMap = new Map<string, { total: number; delivered: number }>();
  for (const o of orders) {
    if (!o.assigned_driver_id) continue;
    const key = o.assigned_driver_id;
    const d = driverMap.get(key) ?? { total: 0, delivered: 0 };
    d.total++;
    if (o.status === "delivered") d.delivered++;
    driverMap.set(key, d);
  }

  return {
    total: orders.length,
    delivered,
    failed,
    active,
    pending: byStatus.pending,
    completionRate: denom === 0 ? 0 : Math.round((delivered / denom) * 100),
    byStatus,
    byZone: [...zoneMap.entries()]
      .map(([zone, v]) => ({ zone, ...v }))
      .sort((a, b) => b.total - a.total),
    byDriver: [...driverMap.entries()]
      .map(([id, v]) => ({ driver: driverName.get(id) ?? id.slice(0, 8), ...v }))
      .sort((a, b) => b.delivered - a.delivered),
  };
}

export type { Order };
