/**
 * CHED MED — Order data access layer (server-side).
 * All functions run against the RLS-protected Supabase client, so the database
 * is the final authority on who can see/do what. These are thin, typed wrappers.
 */
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderCluster, OrderInsert, OrderStatus } from "@/types/database";

const ORDER_COLUMNS =
  "id, status, assigned_driver_id, created_at, customer_name, customer_phone, address, neighborhood, notes, assigned_at, delivered_at, updated_at";

/**
 * All orders visible to the caller (admins: everything; drivers: their own).
 * React `cache()` dedupes repeat calls within a single request (e.g. the
 * dashboard reads orders directly AND via analytics).
 */
export const listOrders = cache(async (): Promise<Order[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Order[];
});

/** Pending, unassigned orders — the admin dispatch queue. */
export async function listPendingOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("status", "pending")
    .is("assigned_driver_id", null)
    .order("neighborhood", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Order[];
}

/**
 * Create an order. `lng`/`lat` are optional; when present we send WKT so
 * PostGIS stores a real geography point.
 */
export async function createOrder(
  input: OrderInsert & { lng?: number | null; lat?: number | null }
): Promise<Order> {
  const supabase = await createClient();

  const { lng, lat, ...rest } = input;
  const payload: Record<string, unknown> = { ...rest };
  if (typeof lng === "number" && typeof lat === "number") {
    // PostgREST accepts EWKT for geography columns.
    payload.coordinates = `SRID=4326;POINT(${lng} ${lat})`;
  }

  const { data, error } = await supabase
    .from("orders")
    .insert(payload)
    .select(ORDER_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return data as Order;
}

/** Advance an order's status (driver workflow). RLS + DB trigger enforce legality. */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}

/**
 * Complete a delivery with Proof of Delivery. Stores the POD storage paths and
 * moves the order to 'delivered' (delivered_at is stamped by the DB trigger).
 */
export async function completeDelivery(
  orderId: string,
  podPhotoUrl: string | null,
  podSignatureUrl: string | null
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({
      status: "delivered",
      pod_photo_url: podPhotoUrl,
      pod_signature_url: podSignatureUrl,
    })
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}

/** Geocoded order points for the fleet map (admins: all; drivers: own). */
export async function getOrdersMap() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("orders_map");
  if (error) throw new Error(error.message);
  return (data ?? []) as import("@/types/database").OrderMapPoint[];
}

/** Admin: assign many orders to one driver via the batch RPC. Returns count. */
export async function batchAssignOrders(
  orderIds: string[],
  driverId: string
): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("batch_assign_orders", {
    order_ids: orderIds,
    driver: driverId,
  });

  if (error) throw new Error(error.message);
  return (data as number) ?? 0;
}

/** Admin: spatial clusters of pending orders for smart dispatch. */
export async function getPendingClusters(
  epsMeters = 500,
  minPoints = 1
): Promise<OrderCluster[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("cluster_pending_orders", {
    eps_meters: epsMeters,
    min_points: minPoints,
  });

  if (error) throw new Error(error.message);
  return (data ?? []) as OrderCluster[];
}

/** All drivers (admin assignment dropdown). */
export async function listDrivers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("role", "driver")
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}
