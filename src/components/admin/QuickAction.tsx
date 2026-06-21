/** Quick-access tile linking to a key admin area. */
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuickAction({
  href,
  title,
  description,
  icon: Icon,
  accent,
  delay,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string; // gradient classes for the icon badge
  delay?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group card-hover animate-scale-in flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4",
        delay
      )}
    >
      <span
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm transition-transform group-hover:scale-110",
          accent
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="truncate text-xs text-slate-500">{description}</p>
      </div>
      <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-brand" />
    </Link>
  );
}
