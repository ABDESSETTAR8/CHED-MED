import type { NextConfig } from "next";
// next-pwa wraps the Next config to generate a Workbox service worker.
// It is disabled in development to avoid caching headaches while coding.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withPWA = require("next-pwa")({
  dest: "public",                       // where sw.js + workbox files are emitted
  register: true,                       // auto-register the service worker
  skipWaiting: true,                    // activate new SW immediately on update
  disable: process.env.NODE_ENV === "development",
  // Shown when a navigation fails and the page isn't cached (dead-zone driving).
  fallbacks: {
    document: "/offline",
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the file-tracing root to this project (silences the "multiple lockfiles"
  // warning caused by a stray lockfile in your home folder).
  outputFileTracingRoot: process.cwd(),
  // Don't fail the production build on ESLint warnings (type-checking stays on).
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add remote image domains (e.g. Supabase Storage for POD photos) in later phases.
  images: {
    remotePatterns: [],
  },
};

export default withPWA(nextConfig as any);
