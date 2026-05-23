"use client";

import { useId, useMemo } from "react";

export function Sparkline({
  data,
  color = "currentColor",
  height = 36,
  className,
  showPeak = false,
}: {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
  showPeak?: boolean;
}) {
  const built = useMemo(() => {
    if (!data.length) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 100;
    const h = 30;
    const step = data.length > 1 ? w / (data.length - 1) : w;

    const pts = data.map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return [x, y, v] as const;
    });

    // Smooth path via Catmull-Rom → Bezier
    const path = pts
      .map(([x, y], i) => {
        if (i === 0) return `M ${x.toFixed(2)} ${y.toFixed(2)}`;
        const [px, py] = pts[i - 1];
        const cpx = (px + x) / 2;
        return `Q ${cpx.toFixed(2)} ${py.toFixed(2)} ${((cpx + x) / 2).toFixed(2)} ${((py + y) / 2).toFixed(2)} T ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");

    const area =
      path + ` L ${w.toFixed(2)} ${h.toFixed(2)} L 0 ${h.toFixed(2)} Z`;

    const peakIdx = pts.reduce(
      (best, p, i) => (p[2] > pts[best][2] ? i : best),
      0,
    );
    const lastPoint = pts[pts.length - 1];

    return { path, area, peak: pts[peakIdx], last: lastPoint, w, h };
  }, [data]);

  const gradId = useId();
  const glowId = useId();

  if (!built) return null;
  const { path, area, peak, last, w, h } = built;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ height, width: "100%", color, display: "block" }}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
        <radialGradient id={glowId}>
          <stop offset="0%" stopColor={color} stopOpacity={0.55} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {showPeak && (
        <>
          <circle cx={peak[0]} cy={peak[1]} r="3.5" fill={`url(#${glowId})`} />
          <circle cx={peak[0]} cy={peak[1]} r="1.4" fill={color} />
        </>
      )}
      {/* Last-point dot — current value */}
      <circle cx={last[0]} cy={last[1]} r="2.6" fill={`url(#${glowId})`} />
      <circle
        cx={last[0]}
        cy={last[1]}
        r="1.2"
        fill="white"
        stroke={color}
        strokeWidth="1"
      />
    </svg>
  );
}
