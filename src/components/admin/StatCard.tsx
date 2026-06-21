/** Compact KPI tile for the analytics dashboard. */
export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

/** A simple horizontal bar (no chart library). `value`/`max` drive the width. */
export function Bar({
  label,
  value,
  max,
  caption,
}: {
  label: string;
  value: number;
  max: number;
  caption?: string;
}) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-500">{caption ?? value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
