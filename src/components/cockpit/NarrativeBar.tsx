"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNarratives, type Narrative } from "@/hooks/useNarratives";
import { cn } from "@/lib/utils";

const KIND_META: Record<
  Narrative["kind"],
  { icon: LucideIcon; tone: string }
> = {
  summary: { icon: Activity, tone: "text-bfresh-blue" },
  trend: { icon: TrendingDown, tone: "text-bfresh-coral" },
  improvement: { icon: TrendingUp, tone: "text-tone-success" },
  risk: { icon: AlertTriangle, tone: "text-tone-warm" },
  anomaly: { icon: Zap, tone: "text-tone-ai" },
  alert: { icon: AlertTriangle, tone: "text-bfresh-coral" },
};

const ROTATE_MS = 6000;
const IMP_RANK = { high: 0, medium: 1, low: 2 } as const;

export function NarrativeBar() {
  const { data, isLoading } = useNarratives();
  const narratives = useMemo(() => {
    const all = data?.narratives ?? [];
    // Sort by importance, then by confidence
    return [...all].sort((a, b) => {
      const ra = IMP_RANK[a.importance];
      const rb = IMP_RANK[b.importance];
      if (ra !== rb) return ra - rb;
      return b.confidence - a.confidence;
    });
  }, [data]);

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (narratives.length <= 1) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % narratives.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [narratives.length]);

  if (isLoading || narratives.length === 0) {
    return (
      <div className="premium-card glass relative flex h-12 items-center gap-3 overflow-hidden rounded-full px-4 text-[12px] font-medium text-muted-foreground">
        <Sparkles className="text-tone-ai size-3.5" />
        <span>מחשב תובנות תפעוליות…</span>
      </div>
    );
  }

  const n = narratives[idx];
  const meta = KIND_META[n.kind];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "premium-card glass relative flex h-12 items-center gap-3 overflow-hidden rounded-full px-4",
      )}
      aria-live="polite"
    >
      <div className="from-tone-ai to-bfresh-light-blue text-white inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-l px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wider shadow-md shadow-tone-ai/30">
        <Sparkles className="size-3" />
        AI
      </div>
      <Icon className={cn("size-4 shrink-0", meta.tone)} />
      <AnimatePresence mode="wait">
        <motion.span
          key={n.id}
          initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-[13px] font-bold leading-none truncate min-w-0 flex-1"
        >
          {n.sentence}
        </motion.span>
      </AnimatePresence>
      <div className="text-muted-foreground hidden shrink-0 items-center gap-1 text-[10.5px] font-bold tabular-nums md:flex">
        <span>{idx + 1}</span>
        <span>/</span>
        <span>{narratives.length}</span>
      </div>
    </div>
  );
}
