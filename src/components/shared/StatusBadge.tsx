/** Color-coded badge for an order status. */
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/database";

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-slate-100 text-slate-600",
  assigned: "bg-blue-100 text-blue-700",
  picked_up: "bg-amber-100 text-amber-700",
  in_transit: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-slate-200 text-slate-500",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-block rounded px-2 py-0.5 text-xs font-medium capitalize",
        STYLES[status]
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
