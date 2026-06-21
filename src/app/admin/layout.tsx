/**
 * Admin area layout. Server-side role guard (defence in depth alongside
 * middleware + RLS) and shared header for every /admin/* page.
 */
import { requireRole } from "@/lib/auth";
import { AppHeader } from "@/components/shared/AppHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("admin");

  return (
    <div className="min-h-screen">
      <AppHeader profile={profile} />
      {children}
    </div>
  );
}
