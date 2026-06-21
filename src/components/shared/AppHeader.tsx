"use client";

/**
 * Sticky, glassy top bar with icon navigation, active-route highlighting, and
 * a responsive collapse (labels hide on small screens, icons remain). Sign-out
 * runs as a server action from an inline form.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Map,
  BarChart3,
  Truck,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "@/app/login/actions";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: Record<Profile["role"], NavItem[]> = {
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: Package },
    { href: "/admin/fleet", label: "Fleet", icon: Map },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ],
  driver: [{ href: "/driver/tasks", label: "My Deliveries", icon: Truck }],
};

export function AppHeader({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const items = NAV[profile.role];
  const home = profile.role === "admin" ? "/admin/dashboard" : "/driver/tasks";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5">
        {/* Brand */}
        <Link href={home} className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-light text-white shadow-sm">
            <Truck className="h-4 w-4" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-gradient">
            CHED MED
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div className="flex items-center gap-2">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight text-slate-800">
              {profile.name || "User"}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              {profile.role}
            </p>
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-semibold text-white">
            {(profile.name || "U").slice(0, 1).toUpperCase()}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              title="Sign out"
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
