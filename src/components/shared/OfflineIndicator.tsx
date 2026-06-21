"use client";

/**
 * Small banner that appears when the browser goes offline. Pairs with the PWA
 * service worker so drivers get clear feedback when working in dead zones —
 * cached task data still renders; new actions queue until reconnect.
 */
import { useEffect, useState } from "react";

export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="sticky top-0 z-50 bg-amber-500 px-4 py-1.5 text-center text-sm font-medium text-white">
      You’re offline — changes will sync when you reconnect.
    </div>
  );
}
