"use client";

/**
 * Client login form. Submits to the `signIn` server action via useActionState,
 * which sets the session cookie and redirects on success, or returns an inline
 * error on failure.
 */
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type AuthResult } from "@/app/login/actions";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";

const initialState: AuthResult = {};

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

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
      />
      <Input
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
  );
}
