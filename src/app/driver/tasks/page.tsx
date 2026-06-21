/**
 * Driver · My Deliveries — guided, card-based task list.
 * RLS guarantees only this driver's assigned orders are returned.
 * Active tasks are shown first; completed/failed move to a collapsed history.
 */
import { CheckCircle2, Truck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listOrders } from "@/lib/orders";
import { TaskCard } from "@/components/driver/TaskCard";
import { ProgressRing } from "@/components/driver/ProgressRing";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyDeliveries } from "@/components/shared/Illustrations";
import type { OrderStatus } from "@/types/database";

export const dynamic = "force-dynamic";

const ACTIVE: OrderStatus[] = ["assigned", "picked_up", "in_transit"];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DriverTasksPage() {
  const [profile, orders] = await Promise.all([requireRole("driver"), listOrders()]);
  const active = orders.filter((o) => ACTIVE.includes(o.status));
  const done = orders.filter((o) => !ACTIVE.includes(o.status));
  const deliveredToday = orders.filter((o) => o.status === "delivered").length;

  return (
    <main className="mx-auto max-w-md space-y-5 p-4">
      {/* Progress header */}
      <section className="animate-scale-in relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand-dark to-slate-900 p-5 text-white shadow-lg">
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/70">{greeting()},</p>
            <h1 className="text-xl font-extrabold">{profile.name || "Driver"} 🚚</h1>
            <p className="mt-1 text-sm text-white/80">
              {active.length} active · {deliveredToday} delivered
            </p>
          </div>
          <ProgressRing done={deliveredToday} total={orders.length} />
        </div>
        <Truck className="animate-float pointer-events-none absolute -bottom-3 -right-2 h-24 w-24 text-white/10" />
      </section>

      {/* Active tasks */}
      {active.length === 0 ? (
        <section className="animate-fade-in rounded-3xl border border-slate-200 bg-white p-6 text-center">
          <EmptyDeliveries className="mx-auto h-40 w-56" />
          <h2 className="mt-2 text-lg font-bold text-slate-800">All caught up!</h2>
          <p className="mt-1 text-sm text-slate-500">
            No active deliveries right now. New tasks will appear here automatically.
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <Truck className="h-4 w-4" /> Active deliveries
          </h2>
          {active.map((o, i) => (
            <TaskCard key={o.id} order={o} index={i} />
          ))}
        </section>
      )}

      {/* History */}
      {done.length > 0 && (
        <details className="animate-fade-in rounded-2xl border border-slate-200 bg-white p-4">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            History ({done.length})
          </summary>
          <ul className="mt-3 space-y-2">
            {done.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-slate-700">
                  {o.customer_name ?? "—"} · {o.address ?? ""}
                </span>
                <StatusBadge status={o.status} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </main>
  );
}
