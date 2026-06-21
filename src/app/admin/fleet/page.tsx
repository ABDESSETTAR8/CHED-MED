/**
 * Admin · Fleet — live map of all geocoded orders, color-coded by status.
 * Driver live positions (driver_locations) can be layered in here next.
 */
import { getOrdersMap } from "@/lib/orders";
import { FleetMap } from "@/components/admin/FleetMap";

export const dynamic = "force-dynamic";

const LEGEND: { label: string; color: string }[] = [
  { label: "Pending", color: "#9e9e9e" },
  { label: "Assigned", color: "#4285f4" },
  { label: "Picked up", color: "#fbbc05" },
  { label: "In transit", color: "#a142f4" },
  { label: "Delivered", color: "#34a853" },
  { label: "Failed", color: "#ea4335" },
];

export default async function FleetPage() {
  const points = await getOrdersMap();

  return (
    <main className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand">Live Fleet</h1>
          <p className="text-sm text-slate-500">
            {points.length} geocoded order(s) on the map.
          </p>
        </div>
        <ul className="flex flex-wrap gap-3 text-xs text-slate-600">
          {LEGEND.map((l) => (
            <li key={l.label} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: l.color }}
              />
              {l.label}
            </li>
          ))}
        </ul>
      </div>

      <FleetMap points={points} />
    </main>
  );
}
