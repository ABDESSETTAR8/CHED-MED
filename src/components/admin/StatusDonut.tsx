/**
 * Dependency-free SVG donut of the order-status distribution.
 * Each status becomes an arc sized by its share of the total.
 */
import type { OrderStatus } from "@/types/database";

const COLORS: Record<OrderStatus, string> = {
  pending: "#94a3b8",
  assigned: "#3b82f6",
  picked_up: "#f59e0b",
  in_transit: "#6366f1",
  delivered: "#22c55e",
  failed: "#ef4444",
  cancelled: "#cbd5e1",
};

const LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  picked_up: "Picked up",
  in_transit: "In transit",
  delivered: "Delivered",
  failed: "Failed",
  cancelled: "Cancelled",
};

export function StatusDonut({
  byStatus,
  total,
}: {
  byStatus: Record<OrderStatus, number>;
  total: number;
}) {
  const r = 56;
  const c = 2 * Math.PI * r;
  const entries = (Object.keys(byStatus) as OrderStatus[])
    .map((s) => ({ status: s, value: byStatus[s] }))
    .filter((e) => e.value > 0);

  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth="16" />
          {total > 0 &&
            entries.map((e) => {
              const frac = e.value / total;
              const dash = frac * c;
              const seg = (
                <circle
                  key={e.status}
                  cx="70"
                  cy="70"
                  r={r}
                  fill="none"
                  stroke={COLORS[e.status]}
                  strokeWidth="16"
                  strokeDasharray={`${dash} ${c - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += dash;
              return seg;
            })}
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{total}</p>
            <p className="text-xs text-slate-400">orders</p>
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-1">
        {entries.length === 0 && <li className="text-slate-400">No orders yet</li>}
        {entries.map((e) => (
          <li key={e.status} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[e.status] }}
            />
            <span className="text-slate-600">{LABELS[e.status]}</span>
            <span className="ml-auto font-semibold text-slate-800">{e.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
