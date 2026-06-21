"use client";

/**
 * A single delivery task card with the driver's guided next step.
 * The card derives the allowed forward action(s) from the current status,
 * mirroring the DB transition guard so the UI never offers an illegal move.
 */
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  MapPin,
  Navigation,
  Phone,
  Package,
  PackageCheck,
  Truck,
  XCircle,
  StickyNote,
} from "lucide-react";
import { advanceStatusAction, type ActionResult } from "@/app/driver/tasks/actions";
import { Button } from "@/components/shared/Button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProofOfDelivery } from "@/components/driver/ProofOfDelivery";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/database";

// Primary "advance" step for each active status. Note: the in_transit -> delivered
// step is handled separately via Proof-of-Delivery capture (see render below).
const NEXT_STEP: Partial<
  Record<OrderStatus, { to: OrderStatus; label: string; icon: typeof Package }>
> = {
  assigned: { to: "picked_up", label: "Mark picked up", icon: PackageCheck },
  picked_up: { to: "in_transit", label: "Start delivery", icon: Truck },
};

// Left accent bar color by status.
const ACCENT: Partial<Record<OrderStatus, string>> = {
  assigned: "bg-blue-500",
  picked_up: "bg-amber-500",
  in_transit: "bg-indigo-500",
};

const initial: ActionResult = {};

function StepButton({
  orderId,
  to,
  label,
  Icon,
  variant = "primary",
}: {
  orderId: string;
  to: OrderStatus;
  label: string;
  Icon: typeof Package;
  variant?: "primary" | "secondary";
}) {
  const [state, action] = useActionState(advanceStatusAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="status" value={to} />
      <Step label={label} Icon={Icon} variant={variant} />
      {state.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
    </form>
  );
}

function Step({
  label,
  Icon,
  variant,
}: {
  label: string;
  Icon: typeof Package;
  variant: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending} className="w-full gap-2">
      <Icon className="h-4 w-4" />
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function TaskCard({ order, index = 0 }: { order: Order; index?: number }) {
  const next = NEXT_STEP[order.status];
  const ACTIVE_STATUSES: OrderStatus[] = ["assigned", "picked_up", "in_transit"];
  const isActive = ACTIVE_STATUSES.includes(order.status);
  const mapsHref =
    order.address &&
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`;

  return (
    <div
      className="card-hover animate-slide-up relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* status accent bar */}
      <span className={cn("absolute inset-y-0 left-0 w-1.5", ACCENT[order.status] ?? "bg-slate-300")} />

      <div className="p-4 pl-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand">
              <Package className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-slate-900">
                {order.customer_name ?? "Customer"}
              </p>
              <p className="flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {order.address ?? "No address"}
              </p>
              {order.neighborhood && (
                <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  {order.neighborhood}
                </span>
              )}
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {order.notes && (
          <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {order.notes}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            {mapsHref && (
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
              >
                <Navigation className="h-4 w-4" /> Navigate
              </a>
            )}
            {order.customer_phone && (
              <a
                href={`tel:${order.customer_phone}`}
                className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
              >
                <Phone className="h-4 w-4" />
              </a>
            )}
          </div>

          {next && (
            <StepButton orderId={order.id} to={next.to} label={next.label} Icon={next.icon} />
          )}

          {/* Final step requires Proof of Delivery capture. */}
          {order.status === "in_transit" && <ProofOfDelivery orderId={order.id} />}

          {isActive && (
            <StepButton
              orderId={order.id}
              to="failed"
              label="Report failed"
              Icon={XCircle}
              variant="secondary"
            />
          )}
        </div>
      </div>
    </div>
  );
}
