/** Animated KPI card with a gradient icon badge and hover lift. */
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardStat({
  icon: Icon,
  label,
  value,
  hint,
  accent,
  delay,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  accent: string; // tailwind gradient classes, e.g. "from-emerald-500 to-emerald-600"
  delay?: string; // e.g. "delay-150"
}) {
  return (
    <div
      className={cn(
        "card-hover animate-slide-up rounded-2xl border border-slate-200 bg-white p-5",
        delay
      )}
    >
      <span
        className={cn(
          "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm",
          accent
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
