/**
 * Driver area layout. Server-side role guard + shared header for /driver/*.
 */
import { requireRole } from "@/lib/auth";
import { AppHeader } from "@/components/shared/AppHeader";

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("driver");

  return (
    <div className="min-h-screen">
      <AppHeader profile={profile} />
      {children}
    </div>
  );
}
