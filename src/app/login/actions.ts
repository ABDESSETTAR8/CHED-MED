"use server";

/**
 * Server Actions for authentication.
 * Running on the server lets Supabase set the secure session cookies via the
 * SSR client; the client form just calls these and handles the result.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthResult {
  error?: string;
}

/**
 * Sign in with email + password, then redirect to the user's role home.
 * On failure we RETURN an error (no throw) so the form can render it inline.
 */
export async function signIn(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Unable to sign in." };
  }

  // Look up role to decide where to land.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  // redirect() throws internally; must be called outside try/catch.
  redirect(profile?.role === "admin" ? "/admin/dashboard" : "/driver/tasks");
}

/** Sign out and return to the login screen. */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
