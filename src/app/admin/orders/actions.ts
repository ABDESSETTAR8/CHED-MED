"use server";

/**
 * Server Actions for admin order management.
 * Each mutates via the RLS-protected data layer then revalidates the page.
 * RLS + DB functions guarantee only admins can actually perform these.
 */
import { revalidatePath } from "next/cache";
import { createOrder, batchAssignOrders } from "@/lib/orders";

export interface ActionResult {
  ok?: boolean;
  error?: string;
  message?: string;
}

/** Create a new delivery order from the admin form. */
export async function createOrderAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const customer_name = String(formData.get("customer_name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const neighborhood = String(formData.get("neighborhood") ?? "").trim();
  const customer_phone = String(formData.get("customer_phone") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  // Optional coordinates.
  const lngRaw = String(formData.get("lng") ?? "").trim();
  const latRaw = String(formData.get("lat") ?? "").trim();

  if (!customer_name || !address) {
    return { error: "Customer name and address are required." };
  }

  try {
    await createOrder({
      customer_name,
      customer_phone: customer_phone || null,
      address,
      neighborhood: neighborhood || null,
      notes: notes || null,
      lng: lngRaw ? Number(lngRaw) : null,
      lat: latRaw ? Number(latRaw) : null,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create order." };
  }

  revalidatePath("/admin/orders");
  return { ok: true, message: "Order created." };
}

/** Batch-assign selected orders to a driver. */
export async function assignOrdersAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const driverId = String(formData.get("driver_id") ?? "");
  const orderIds = formData.getAll("order_ids").map(String).filter(Boolean);

  if (!driverId) return { error: "Select a driver." };
  if (orderIds.length === 0) return { error: "Select at least one order." };

  try {
    const count = await batchAssignOrders(orderIds, driverId);
    revalidatePath("/admin/orders");
    return { ok: true, message: `Assigned ${count} order(s).` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to assign orders." };
  }
}
