import type { Config } from "tailwindcss";

// Tailwind scans these paths for class names. shadcn/ui components (added in a
// later phase) live under src/components and are already covered here.
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CHED MED brand palette (teal) + accents used across the UI.
        brand: {
          DEFAULT: "#0F766E", // teal-700
          dark: "#115E59",
          light: "#14B8A6",
          50: "#F0FDFA",
          100: "#CCFBF1",
        },
      },
      // Entrance + ambient animations (used via animate-* classes).
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in .5s ease-out both",
        "slide-up": "slide-up .5s ease-out both",
        "scale-in": "scale-in .35s ease-out both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
