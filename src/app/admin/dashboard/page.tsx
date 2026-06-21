/**
 * Admin · Dashboard — command center overview.
 * Pulls live analytics + recent orders (RLS-backed) and presents an animated,
 * fully responsive summary with quick access to every management area.
 */
import Link from "next/link";
import {
  Package,
  Truck,
  Clock,
  CheckCircle2,
  Plus,
  Map,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getAnalytics } from "@/lib/analytics";
import { listOrders } from "@/lib/orders";
import { DashboardStat } from "@/components/admin/DashboardStat";
import { QuickAction } from "@/components/admin/QuickAction";
import { StatusDonut } from "@/components/admin/StatusDonut";
import { StatusBadge } from "@/components/shared/StatusBadge";

export const dynamic = "force-dynamic";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function AdminDashboardPage() {
  const [profile, analytics, orders] = await Promise.all([
    requireRole("admin"),
    getAnalytics(),
    listOrders(),
  ]);
  const recent = orders.slice(0, 6);

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand-dark to-slate-900 p-6 text-white shadow-lg sm:p-8">
        <div className="relative z-10">
          <p className="animate-fade-in text-sm text-white/70">{greeting()},</p>
          <h1 className="animate-slide-up text-2xl font-extrabold sm:text-3xl">
            {profile.name || "Admin"} 👋
          </h1>
          <p className="animate-slide-up delay-150 mt-1 max-w-md text-sm text-white/80">
            Here's what's happening across your fleet today. {analytics.active} active,{" "}
            {analytics.pending} awaiting dispatch.
          </p>
          <div className="animate-slide-up delay-300 mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand shadow-sm transition-transform hover:scale-105"
            >
              <Plus className="h-4 w-4" /> New order
            </Link>
            <Link
              href="/admin/fleet"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
            >
              <Map className="h-4 w-4" /> Live fleet
            </Link>
          </div>
        </div>
        {/* Decorative floating glyphs */}
        <Truck className="animate-float pointer-events-none absolute -right-2 top-6 h-28 w-28 text-white/10" />
        <Package className="pointer-events-none absolute right-28 bottom-2 h-16 w-16 text-white/10" />
      </section>

      {/* KPI cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardStat
          icon={Package}
          label="Total orders"
          value={analytics.total}
          accent="from-slate-600 to-slate-800"
        />
        <DashboardStat
          icon={CheckCircle2}
          label="Delivered"
          value={analytics.delivered}
          hint={`${analytics.completionRate}% completion`}
          accent="from-emerald-500 to-emerald-600"
          delay="delay-75"
        />
        <DashboardStat
          icon={Truck}
          label="Active now"
          value={analytics.active}
          hint="in progress"
          accent="from-indigo-500 to-indigo-600"
          delay="delay-150"
        />
        <DashboardStat
          icon={Clock}
          label="Pending"
          value={analytics.pending}
          hint="awaiting dispatch"
          accent="from-amber-500 to-orange-500"
          delay="delay-300"
        />
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Manage
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            href="/admin/orders"
            title="Orders & dispatch"
            description="Create, batch-assign by zone"
            icon={Package}
            accent="from-brand to-brand-light"
          />
          <QuickAction
            href="/admin/fleet"
            title="Live fleet map"
            description="Track orders in real time"
            icon={Map}
            accent="from-indigo-500 to-violet-500"
            delay="delay-75"
          />
          <QuickAction
            href="/admin/analytics"
            title="Analytics"
            description="Zones & driver efficiency"
            icon={BarChart3}
            accent="from-fuchsia-500 to-pink-500"
            delay="delay-150"
          />
          <QuickAction
            href="/admin/orders"
            title="New delivery"
            description="Add an order quickly"
            icon={Plus}
            accent="from-amber-500 to-orange-500"
            delay="delay-300"
          />
        </div>
      </section>

      {/* Distribution + recent */}
      <section className="grid gap-4 lg:grid-cols-5">
        <div className="animate-fade-in rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold text-slate-800">Status overview</h2>
          <StatusDonut byStatus={analytics.byStatus} total={analytics.total} />
        </div>

        <div className="animate-fade-in delay-150 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No orders yet — create your first one.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center gap-3 py-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                    <Package className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {o.customer_name ?? "Unnamed customer"}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {o.neighborhood ?? "Unzoned"} · {o.address ?? "no address"}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
