"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Info,
  ArrowLeft,
  ChevronDown,
  Wand2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SPRING_SMOOTH, enterUp } from "@/lib/motion";
import type { AIInsight } from "@/types/domain";

const KIND_META = {
  positive: {
    icon: TrendingUp,
    badge: "חיובי",
    badgeClass: "bg-emerald-500/12 text-emerald-700 border-emerald-500/30",
    bar: "from-emerald-500 to-bfresh-fresh-green",
    iconBg: "bg-gradient-to-br from-emerald-500 to-bfresh-fresh-green text-white",
    glow: "glow-green",
    confidenceColor: "bg-emerald-500",
    action: "צפה בפרטים",
  },
  warning: {
    icon: AlertTriangle,
    badge: "התרעה",
    badgeClass: "bg-amber-500/12 text-amber-700 border-amber-500/30",
    bar: "from-amber-500 to-orange-500",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500 text-white",
    glow: "glow-amber",
    confidenceColor: "bg-amber-500",
    action: "בדוק והגב",
  },
  info: {
    icon: Info,
    badge: "תובנה",
    badgeClass: "bg-bfresh-blue/12 text-bfresh-blue border-bfresh-blue/30",
    bar: "from-bfresh-blue to-bfresh-light-blue",
    iconBg: "bg-gradient-to-br from-bfresh-blue to-bfresh-light-blue text-white",
    glow: "glow-blue",
    confidenceColor: "bg-bfresh-blue",
    action: "חקור עוד",
  },
} as const;

const IMPORTANCE_RANK = { high: 0, medium: 1, low: 2 } as const;

export function AIInsights({ insights }: { insights: AIInsight[] }) {
  const sorted = [...insights].sort(
    (a, b) =>
      (IMPORTANCE_RANK[a.importance ?? "low"] ?? 9) -
      (IMPORTANCE_RANK[b.importance ?? "low"] ?? 9),
  );

  return (
    <Card className="premium-card flex h-full flex-col overflow-hidden border-0 bg-transparent shadow-none">
      <CardHeader className="border-border/50 flex-row items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="from-bfresh-blue to-bfresh-fresh-green shadow-bfresh-blue/30 grid size-11 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg ring-1 ring-white/30">
              <Sparkles className="size-[18px]" />
            </div>
            <motion.span
              animate={{ scale: [1, 1.35, 1], opacity: [0.45, 0, 0.45] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
              className="from-bfresh-blue to-bfresh-fresh-green pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br"
            />
          </div>
          <div>
            <CardTitle className="text-base font-bold tracking-tight">
              תובנות AI · Copilot תפעולי
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              מסקנות מבוססות נתוני הרשת · מתעדכן ברקע
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="border-bfresh-blue/30 bg-bfresh-blue/8 text-bfresh-blue gap-1 rounded-full text-[10px] font-black tracking-widest"
        >
          <Wand2 className="size-3" />
          BETA
        </Badge>
      </CardHeader>
      <CardContent className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
        {sorted.map((ins, i) => (
          <InsightCard key={ins.id} insight={ins} index={i} />
        ))}
      </CardContent>
    </Card>
  );
}

function InsightCard({
  insight: ins,
  index,
}: {
  insight: AIInsight;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const meta = KIND_META[ins.kind];
  const Icon = meta.icon;
  const confidence = Math.round((ins.confidence ?? 0.85) * 100);

  return (
    <motion.div
      variants={enterUp(index)}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2 }}
      transition={SPRING_SMOOTH}
      className={cn(
        "premium-card group relative flex flex-col gap-2.5 overflow-hidden p-4 transition-shadow",
        meta.glow,
      )}
    >
      {/* Importance pulse */}
      {ins.importance === "high" && (
        <motion.span
          aria-hidden
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "pointer-events-none absolute -inset-px rounded-[var(--radius-lg)]",
            "bg-gradient-to-br from-current/0 via-current/0 to-current/10",
            ins.kind === "warning" ? "text-amber-500" : "text-bfresh-blue",
          )}
        />
      )}

      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 end-0 w-1 bg-gradient-to-b",
          meta.bar,
        )}
      />

      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl shadow-md ring-1 ring-white/30",
            meta.iconBg,
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "rounded-full text-[10px] uppercase tracking-wider",
                meta.badgeClass,
              )}
            >
              {meta.badge}
            </Badge>
            {ins.importance === "high" && (
              <Badge
                variant="outline"
                className="border-rose-500/30 bg-rose-500/10 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-wider"
              >
                עדיפות גבוהה
              </Badge>
            )}
            {ins.metric && (
              <span className="text-muted-foreground text-[11px] font-bold tabular-nums">
                {ins.metric}
              </span>
            )}
          </div>
          <div className="text-foreground text-sm font-bold leading-snug">
            {ins.title}
          </div>
        </div>
      </div>

      <p className="text-muted-foreground relative pe-1 text-xs leading-relaxed">
        {ins.detail}
      </p>

      {/* Confidence bar */}
      <div className="relative">
        <div className="text-muted-foreground mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
          <span>רמת ביטחון</span>
          <span className="tabular-nums">{confidence}%</span>
        </div>
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.9, delay: index * 0.05 + 0.2 }}
            className={cn("h-full rounded-full", meta.confidenceColor)}
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && ins.recommendation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="bg-muted/40 ring-border/40 relative rounded-xl p-3 text-[11.5px] ring-1"
          >
            <div className="text-muted-foreground mb-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider">
              <Wand2 className="size-3" />
              המלצה לפעולה
            </div>
            <p className="text-foreground leading-relaxed">
              {ins.recommendation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mt-auto flex items-center justify-between gap-2">
        {ins.recommendation && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[10.5px] font-bold transition-colors"
          >
            <ChevronDown
              className={cn(
                "size-3 transition-transform",
                open && "rotate-180",
              )}
            />
            {open ? "הסתר" : "המלצה"}
          </button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-foreground/70 hover:text-foreground hover:bg-accent/40 ms-auto h-7 gap-1 rounded-lg px-2 text-[11px] font-bold"
        >
          {meta.action}
          <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
        </Button>
      </div>
    </motion.div>
  );
}
