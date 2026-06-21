"use client";

/**
 * Lightweight canvas signature pad (no dependencies). Supports mouse + touch.
 * Exposes the drawn signature as a PNG Blob via the `onChange` callback.
 */
import { useEffect, useRef, useState } from "react";

interface Props {
  onChange: (blob: Blob | null) => void;
  height?: number;
}

export function SignaturePad({ onChange, height = 160 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Match the backing store to the displayed size for crisp lines.
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = height * ratio;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#0f172a";
    }
  }, [height]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    const p = pos(e);
    ctx?.beginPath();
    ctx?.moveTo(p.x, p.y);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const p = pos(e);
    ctx?.lineTo(p.x, p.y);
    ctx?.stroke();
    setHasInk(true);
  }

  function end() {
    drawing.current = false;
    if (!hasInk) return onChange(null);
    canvasRef.current?.toBlob((blob) => onChange(blob), "image/png");
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange(null);
  }

  return (
    <div className="space-y-1">
      <canvas
        ref={canvasRef}
        style={{ height, touchAction: "none" }}
        className="w-full rounded-lg border border-slate-300 bg-white"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <button
        type="button"
        onClick={clear}
        className="text-xs text-slate-500 hover:underline"
      >
        Clear signature
      </button>
    </div>
  );
}
