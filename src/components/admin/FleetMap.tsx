"use client";

/**
 * Live fleet map using the Google Maps JavaScript API.
 * Loads the script once, drops a color-coded marker per geocoded order, and
 * auto-fits the viewport to the points. No npm wrapper — keeps the bundle lean.
 *
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in the environment.
 */
import { useEffect, useRef, useState } from "react";
import type { OrderMapPoint, OrderStatus } from "@/types/database";

// Marker colors by status (Google's classic pin set).
const PIN: Partial<Record<OrderStatus, string>> = {
  pending: "https://maps.google.com/mapfiles/ms/icons/grey.png",
  assigned: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  picked_up: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  in_transit: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
  delivered: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  failed: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
};

declare global {
  interface Window {
    google?: any;
    __chedmedMapInit?: () => void;
  }
}

function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) return resolve();
    const existing = document.getElementById("gmaps-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "gmaps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
}

export function FleetMap({ points }: { points: OrderMapPoint[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setError("Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable the map.");
      return;
    }
    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !ref.current) return;
        const g = window.google;
        const map = new g.maps.Map(ref.current, {
          center: { lat: 0, lng: 0 },
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
        });

        const bounds = new g.maps.LatLngBounds();
        points.forEach((p) => {
          const position = { lat: p.lat, lng: p.lon };
          const marker = new g.maps.Marker({
            position,
            map,
            icon: PIN[p.status],
            title: `${p.customer_name ?? "Order"} · ${p.status}`,
          });
          const info = new g.maps.InfoWindow({
            content: `<strong>${p.customer_name ?? "Order"}</strong><br/>${p.neighborhood ?? ""}<br/>${p.status}`,
          });
          marker.addListener("click", () => info.open(map, marker));
          bounds.extend(position);
        });

        if (points.length > 0) map.fitBounds(bounds);
      })
      .catch((e) => setError(e.message));

    return () => {
      cancelled = true;
    };
  }, [apiKey, points]);

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500">
        {error}
      </div>
    );
  }

  return <div ref={ref} className="h-[60vh] w-full rounded-xl border border-slate-200" />;
}
