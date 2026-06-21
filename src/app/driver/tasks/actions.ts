"use server";

/**
 * Driver workflow actions. Status changes are validated twice: the DB trigger
 * enforce_order_transition() rejects illegal jumps, and RLS ensures the driver
 * can only touch their own orders.
 */
import { revalidatePath } from "next/cache";
import { updateOrderStatus, completeDelivery } from "@/lib/orders";
import type { OrderStatus } from "@/types/database";

export interface ActionResult {
  ok?: boolean;
  error?: string;
}

export async function advanceStatusAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const orderId = String(formData.get("order_id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;

  if (!orderId || !status) return { error: "Missing order or status." };

  try {
    await updateOrderStatus(orderId, status);
    revalidatePath("/driver/tasks");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Update failed." };
  }
}

/**
 * Complete a delivery with Proof of Delivery. The client uploads photo +
 * signature to Storage first, then passes their paths here to finalize.
 */
export async function completeDeliveryAction(
  orderId: string,
  podPhotoUrl: string | null,
  podSignatureUrl: string | null
): Promise<ActionResult> {
  if (!orderId) return { error: "Missing order." };

  try {
    await completeDelivery(orderId, podPhotoUrl, podSignatureUrl);
    revalidatePath("/driver/tasks");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not complete delivery." };
  }
}
