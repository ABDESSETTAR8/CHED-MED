"use client";

/**
 * Client login form. Submits to the `signIn` server action via useActionState,
 * which sets the session cookie and redirects on success, or returns an inline
 * error on failure.
 *
 * Includes one-click DEMO buttons (for portfolio visitors): they fill the form
 * with a demo account's credentials and submit automatically. The matching
 * users must exist in Supabase Auth (see DEMO_ACCOUNTS below).
 */
import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Shield, Truck } from "lucide-react";
import { signIn, type AuthResult } from "@/app/login/actions";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";

const initialState: AuthResult = {};

// Demo credentials shown on the login page. Create these exact users in
// Supabase → Authentication → Users (Add user), and set the admin's role.
const DEMO_ACCOUNTS = {
  admin: { email: "admin@gmail.com", password: "123456789" },
  driver: { email: "driver@gmail.com", password: "123456789" },
};

// Separate component so we can read pending state from the enclosing <form>.
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(signIn, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Fill the inputs with a demo account, then submit the form automatically.
  function loginAs(role: keyof typeof DEMO_ACCOUNTS) {
    const { email, password } = DEMO_ACCOUNTS[role];
    if (emailRef.current) emailRef.current.value = email;
    if (passwordRef.current) passwordRef.current.value = password;
    formRef.current?.requestSubmit();
  }

  return (
    <div className="flex flex-col gap-4">
      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <Input
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          required
        />
        <Input
          ref={passwordRef}
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          required
        />

        {state.error && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>

      {/* Demo quick-login */}
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-2 text-xs uppercase tracking-wide text-slate-400">
            or try a demo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => loginAs("admin")}
          className="flex items-center justify-center gap-2 rounded-lg border border-brand/30 bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand transition-colors hover:bg-brand-100"
        >
          <Shield className="h-4 w-4" /> Demo Admin
        </button>
        <button
          type="button"
          onClick={() => loginAs("driver")}
          className="flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
        >
          <Truck className="h-4 w-4" /> Demo Driver
        </button>
      </div>

      <p className="text-center text-[11px] leading-relaxed text-slate-400">
        Demo accounts are ready to explore. Admin sees dispatch, fleet &amp;
        analytics; Driver sees the delivery workflow.
      </p>
    </div>
  );
}
