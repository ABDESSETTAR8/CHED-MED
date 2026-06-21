/**
 * Public landing page.
 * Logged-in users are redirected by middleware to their role home
 * (/admin/dashboard or /driver/tasks) before they ever see this.
 */
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div>
        <h1 className="text-3xl font-bold text-brand">CHED MED</h1>
        <p className="mt-2 text-slate-600">
          Intelligent last-mile delivery management.
        </p>
      </div>
      <Link
        href="/login"
        className="rounded-lg bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark"
      >
        Sign in
      </Link>
    </main>
  );
}
