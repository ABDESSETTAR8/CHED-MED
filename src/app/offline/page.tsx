/**
 * Offline fallback. Served by the service worker when a navigation request
 * fails and the page isn't in cache. Kept static + dependency-free so it always
 * renders.
 */
export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-xl font-semibold text-brand">You’re offline</h1>
      <p className="max-w-xs text-sm text-slate-500">
        CHED MED can’t reach the network right now. Your cached tasks are still
        available — reconnect to sync any updates.
      </p>
    </main>
  );
}
