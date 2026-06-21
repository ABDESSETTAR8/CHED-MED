/**
 * OAuth / email-confirmation callback.
 * Supabase redirects here with a `code` that we exchange for a session, then
 * forward the user on. Used for email-link confirmations and (later) OAuth.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — bounce to login with a flag.
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
