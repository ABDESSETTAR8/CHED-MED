/**
 * Server-side auth helpers shared across Server Components and layouts.
 */
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";

/**
 * Returns the current user's profile, or null if not authenticated.
 * RLS guarantees a user can read their own profile row.
 *
 * Wrapped in React `cache()` so that when a layout AND its page both need the
 * profile in the same request, Supabase is hit only once (request-level memo).
 */
export const getCurrentProfile = cache(
  async (): Promise<Profile | null> => {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return profile ?? null;
  }
);

/**
 * Guards a Server Component/layout: ensures the caller is signed in AND (if
 * `role` is given) has that exact role. Redirects otherwise. Returns the
 * profile so callers can use it directly.
 */
export async function requireRole(role?: UserRole): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }
  if (role && profile.role !== role) {
    // Send the user to their own area instead of showing a forbidden page.
    redirect(profile.role === "admin" ? "/admin/dashboard" : "/driver/tasks");
  }

  return profile;
}
