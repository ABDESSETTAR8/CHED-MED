/**
 * Lightweight inline SVG illustrations (no external assets). Colors use the
 * brand palette so they sit naturally in the UI.
 */

/** Friendly "all done / nothing here" delivery scene. */
export function EmptyDeliveries({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 180" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="boxG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      {/* ground shadow */}
      <ellipse cx="120" cy="158" rx="78" ry="10" fill="#0f766e" opacity="0.08" />
      {/* sun / sparkle */}
      <circle cx="196" cy="40" r="18" fill="#fde68a" opacity="0.7" />
      <g stroke="#fbbf24" strokeWidth="3" strokeLinecap="round">
        <line x1="196" y1="10" x2="196" y2="18" />
        <line x1="222" y1="40" x2="214" y2="40" />
        <line x1="214" y1="22" x2="208" y2="28" />
      </g>
      {/* open empty box */}
      <path d="M70 96 l50 -16 50 16 -50 16 z" fill="url(#boxG)" />
      <path d="M70 96 l50 16 v44 l-50 -16 z" fill="#0f766e" />
      <path d="M170 96 l-50 16 v44 l50 -16 z" fill="#0d9488" />
      {/* flaps */}
      <path d="M70 96 l16 -22 44 6 -10 24z" fill="#5eead4" opacity="0.85" />
      <path d="M170 96 l-16 -22 -44 6 10 24z" fill="#99f6e4" opacity="0.85" />
      {/* check badge */}
      <circle cx="120" cy="70" r="16" fill="#22c55e" />
      <path d="M113 70 l5 5 9 -10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Simple delivery van, used in headers/heroes. */
export function DeliveryVan({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="40" width="90" height="48" rx="6" fill="#0f766e" />
      <path d="M110 52 h34 l24 20 v16 h-58 z" fill="#14b8a6" />
      <rect x="120" y="56" width="22" height="16" rx="3" fill="#cffafe" />
      <circle cx="58" cy="92" r="12" fill="#0f172a" />
      <circle cx="58" cy="92" r="5" fill="#94a3b8" />
      <circle cx="148" cy="92" r="12" fill="#0f172a" />
      <circle cx="148" cy="92" r="5" fill="#94a3b8" />
    </svg>
  );
}
