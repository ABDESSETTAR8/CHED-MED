"use client";

/**
 * Proof-of-Delivery capture: a package photo + a customer signature.
 * Files upload directly to the private "pod" Storage bucket (RLS-guarded),
 * then we call completeDeliveryAction with their paths to mark the order
 * delivered. Kept on the client so capture works offline-first; the final
 * action is queued by the browser/SW when connectivity returns.
 */
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { completeDeliveryAction } from "@/app/driver/tasks/actions";
import { SignaturePad } from "@/components/driver/SignaturePad";
import { Button } from "@/components/shared/Button";

export function ProofOfDelivery({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [signature, setSignature] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function upload(path: string, body: Blob, contentType: string) {
    const supabase = createClient();
    const { error: upErr } = await supabase.storage
      .from("pod")
      .upload(path, body, { contentType, upsert: true });
    if (upErr) throw new Error(upErr.message);
    return path;
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        let photoPath: string | null = null;
        let sigPath: string | null = null;

        if (photo) {
          photoPath = await upload(`${orderId}/photo.jpg`, photo, photo.type || "image/jpeg");
        }
        if (signature) {
          sigPath = await upload(`${orderId}/signature.png`, signature, "image/png");
        }

        const res = await completeDeliveryAction(orderId, photoPath, sigPath);
        if (res.error) setError(res.error);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed.");
      }
    });
  }

  if (!open) {
    return (
      <Button className="w-full" onClick={() => setOpen(true)}>
        Mark delivered (capture POD)
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 p-3">
      <div>
        <label className="text-sm font-medium text-slate-700">Package photo</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Customer signature</label>
        <SignaturePad onChange={setSignature} />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button className="flex-1" onClick={submit} disabled={pending}>
          {pending ? "Saving…" : "Confirm delivery"}
        </Button>
        <Button variant="secondary" onClick={() => setOpen(false)} disabled={pending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
