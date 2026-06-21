import type { Metadata, Viewport } from "next";
import "./globals.css";
import { OfflineIndicator } from "@/components/shared/OfflineIndicator";

// Next.js automatically links the manifest and theme color from this metadata.
export const metadata: Metadata = {
  title: "CHED MED",
  description: "Intelligent last-mile delivery management.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CHED MED",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F766E",
  width: "device-width",
  initialScale: 1,
  // Lock zoom for an app-like feel on mobile (drivers' primary device).
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <OfflineIndicator />
        {children}
      </body>
    </html>
  );
}
