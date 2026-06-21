/**
 * Login page. If already authenticated, bounce to the role home.
 */
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { LoginForm } from "@/components/shared/LoginForm";

export default async function LoginPage() {
  const profile = await getCurrentProfile();
  if (profile) {
    redirect(profile.role === "admin" ? "/admin/dashboard" : "/driver/tasks");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-brand">CHED MED</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
