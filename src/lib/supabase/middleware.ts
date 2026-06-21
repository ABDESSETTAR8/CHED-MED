/**
 * Supabase session helper for Next.js middleware.
 *
 * Creates a request-scoped client that refreshes the auth session (rotating
 * cookies) on every request, and returns both the response and the client so
 * the caller (src/middleware.ts) can read the user + role for route guarding.
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export function createMiddlewareClient(request: NextRequest) {
  // Start with a pass-through response we can attach refreshed cookies to.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          // Write cookies onto both the request (for downstream reads) and the
          // outgoing response (so the browser receives the refreshed session).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response };
}
