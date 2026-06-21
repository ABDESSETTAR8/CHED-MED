/**
 * Browser-side Supabase client (for Client Components / "use client").
 * Uses the public anon key; all access is governed by RLS.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
