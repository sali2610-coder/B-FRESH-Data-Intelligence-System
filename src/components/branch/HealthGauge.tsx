"use client";

import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { scoreColor, STATUS_LABEL, STATUS_TONE } from "@/lib/health";
import { cn } from "@/lib/utils";
import type { BranchStatus } from "@/types/domain";

export function HealthGauge({
  score,
  status,
  size = 160,
}: {
  score: number;
  status: BranchStatus;
  size?: number;
}) {
  const r = 64;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const offset = c * (1 - pct / 100);
  const color = scoreColor(score);
  const tone = STATUS_TONE[status];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        className="-rotate-90"
      >
        <defs>
          <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.95} />
            <stop offset="100%" stopColor={color} stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-muted/60"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            filter: `drop-shadow(0 0 12px ${color}55)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-1">
          <div className="text-4xl font-black leading-none tabular-nums">
            <NumberFlow
              value={score}
              locales="he-IL"
              spinTiming={{
                duration: 900,
                easing: "cubic-bezier(0.22,1,0.36,1)",
              }}
            />
          </div>
          <div
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
              tone.chip,
            )}
          >
            {STATUS_LABEL[status]}
          </div>
        </div>
      </div>
    </div>
  );
}
