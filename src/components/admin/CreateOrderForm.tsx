"use client";

/**
 * Admin form to create a delivery order. Coordinates are optional — if omitted,
 * the order stays geocodable later (and won't appear in spatial clusters yet).
 */
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createOrderAction, type ActionResult } from "@/app/admin/orders/actions";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";

const initial: ActionResult = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create order"}
    </Button>
  );
}

export function CreateOrderForm() {
  const [state, action] = useActionState(createOrderAction, initial);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <Input id="customer_name" name="customer_name" label="Customer name" required />
      <Input id="customer_phone" name="customer_phone" label="Phone" />
      <Input id="address" name="address" label="Address" required className="sm:col-span-2" />
      <Input id="neighborhood" name="neighborhood" label="Neighborhood (batch key)" />
      <Input id="notes" name="notes" label="Notes" />
      <Input id="lng" name="lng" label="Longitude (optional)" inputMode="decimal" />
      <Input id="lat" name="lat" label="Latitude (optional)" inputMode="decimal" />

      <div className="sm:col-span-2 flex items-center gap-3">
        <Submit />
        {state.error && <span className="text-sm text-red-600">{state.error}</span>}
        {state.ok && <span className="text-sm text-green-600">{state.message}</span>}
      </div>
    </form>
  );
}
