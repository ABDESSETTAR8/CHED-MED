/**
 * Admin · Analytics — delivery KPIs, zone performance, driver efficiency.
 */
import { getAnalytics } from "@/lib/analytics";
import { StatCard, Bar } from "@/components/admin/StatCard";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const a = await getAnalytics();
  const zoneMax = Math.max(1, ...a.byZone.map((z) => z.total));
  const driverMax = Math.max(1, ...a.byDriver.map((d) => d.total));

  return (
    <main className="space-y-8 p-6">
      <h1 className="text-2xl font-bold text-brand">Analytics</h1>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total orders" value={a.total} />
        <StatCard label="Completion rate" value={`${a.completionRate}%`} hint="delivered / (delivered + failed)" />
        <StatCard label="Active" value={a.active} hint="in progress now" />
        <StatCard label="Pending" value={a.pending} hint="awaiting dispatch" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <h2 className="mb-4 font-semibold text-slate-800">Zone performance</h2>
          <div className="space-y-3">
            {a.byZone.length === 0 ? (
              <p className="text-sm text-slate-500">No data yet.</p>
            ) : (
              a.byZone.map((z) => (
                <Bar
                  key={z.zone}
                  label={z.zone}
                  value={z.total}
                  max={zoneMax}
                  caption={`${z.delivered}/${z.total} delivered`}
                />
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <h2 className="mb-4 font-semibold text-slate-800">Driver efficiency</h2>
          <div className="space-y-3">
            {a.byDriver.length === 0 ? (
              <p className="text-sm text-slate-500">No assignments yet.</p>
            ) : (
              a.byDriver.map((d) => (
                <Bar
                  key={d.driver}
                  label={d.driver}
                  value={d.total}
                  max={driverMax}
                  caption={`${d.delivered}/${d.total} delivered`}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
