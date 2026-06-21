/**
 * CHED MED — Auth/session middleware (lean).
 *
 * Runs on every matched request and:
 *   1. Refreshes the Supabase auth session (rotating cookies).
 *   2. Redirects unauthenticated users to /login.
 *   3. Routes a logged-in user landing on "/" to their role home.
 *
 * PERFORMANCE NOTE: We intentionally do NOT query the `profiles` table here on
 * every request. Per-area role enforcement lives in the route-group layouts
 * (`requireRole()` in src/app/(admin|driver)/layout.tsx), backed by RLS in the
 * database. That keeps each navigation to a single auth round-trip instead of
 * auth + a profiles query on every page.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

// Public paths that never require authentication.
const PUBLIC_PATHS = ["/login", "/auth", "/offline"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);
  const { pathname } = request.nextUrl;

  // 1. Always refresh the session (single round-trip).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Public routes pass straight through.
  if (isPublic(pathname)) {
    return response;
  }

  // 3. Not logged in -> /login, remembering the intended destination.
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  // 4. Only the bare "/" needs the role to pick a home; query it just here.
  if (pathname === "/") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = profile?.role === "admin" ? "/admin/dashboard" : "/driver/tasks";
    return NextResponse.redirect(url);
  }

  // 5. Everything else: authenticated. Layouts enforce role + RLS enforces data.
  return response;
}

// Run on everything except static assets, image optimizer, and PWA files.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|workbox-.*|icons/.*).*)",
  ],
};
