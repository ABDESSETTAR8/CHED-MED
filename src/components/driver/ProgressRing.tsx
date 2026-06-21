/** SVG progress ring showing completed vs total deliveries for the day. */
export function ProgressRing({
  done,
  total,
  size = 72,
}: {
  done: number;
  total: number;
  size?: number;
}) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total === 0 ? 0 : done / total;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="white"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center text-white">
        <div>
          <p className="text-lg font-bold leading-none">{done}</p>
          <p className="text-[10px] text-white/70">of {total}</p>
        </div>
      </div>
    </div>
  );
}
