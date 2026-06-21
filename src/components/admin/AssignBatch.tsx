"use client";

/**
 * Smart-dispatch panel: pending orders grouped by neighborhood with checkboxes,
 * plus a driver selector. "Select all in neighborhood" makes batch assignment
 * one click. Submits to assignOrdersAction.
 */
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { assignOrdersAction, type ActionResult } from "@/app/admin/orders/actions";
import { Button } from "@/components/shared/Button";
import type { Order } from "@/types/database";

interface Props {
  pending: Order[];
  drivers: { id: string; name: string }[];
}

const initial: ActionResult = {};

function Submit({ count }: { count: number }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || count === 0}>
      {pending ? "Assigning…" : `Assign ${count} order(s)`}
    </Button>
  );
}

export function AssignBatch({ pending, drivers }: Props) {
  const [state, action] = useActionState(assignOrdersAction, initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Group pending orders by neighborhood for tidy batching.
  const groups = pending.reduce<Record<string, Order[]>>((acc, o) => {
    const key = o.neighborhood || "Unzoned";
    (acc[key] ??= []).push(o);
    return acc;
  }, {});

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleGroup(ids: string[], on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });
  }

  if (pending.length === 0) {
    return <p className="text-sm text-slate-500">No pending orders to dispatch.</p>;
  }

  return (
    <form action={action} className="space-y-4">
      {Object.entries(groups).map(([zone, orders]) => {
        const ids = orders.map((o) => o.id);
        const allOn = ids.every((id) => selected.has(id));
        return (
          <div key={zone} className="rounded-lg border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium text-slate-800">{zone}</h3>
              <button
                type="button"
                onClick={() => toggleGroup(ids, !allOn)}
                className="text-xs text-brand hover:underline"
              >
                {allOn ? "Clear" : "Select all"}
              </button>
            </div>
            <ul className="space-y-1">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.has(o.id)}
                    onChange={() => toggle(o.id)}
                  />
                  <span className="text-slate-700">
                    {o.customer_name ?? "—"} · {o.address ?? "no address"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {/* Hidden inputs carry the current selection to the server action. */}
      {[...selected].map((id) => (
        <input key={id} type="hidden" name="order_ids" value={id} />
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <select
          name="driver_id"
          defaultValue=""
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Choose driver…
          </option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name || d.id.slice(0, 8)}
            </option>
          ))}
        </select>

        <Submit count={selected.size} />

        {state.error && <span className="text-sm text-red-600">{state.error}</span>}
        {state.ok && <span className="text-sm text-green-600">{state.message}</span>}
      </div>
    </form>
  );
}
