"use client";

import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Info,
  Wand2,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SPRING_SMOOTH } from "@/lib/motion";
import type { AIInsight } from "@/types/domain";

const KIND_META = {
  positive: {
    icon: TrendingUp,
    chip:
      "bg-bfresh-fresh-green/12 text-tone-success border-bfresh-fresh-green/30",
    iconBg:
      "bg-gradient-to-br from-bfresh-fresh-green to-bfresh-light-blue",
    bar: "from-bfresh-fresh-green to-bfresh-light-blue",
    confidence: "bg-bfresh-fresh-green",
  },
  warning: {
    icon: AlertTriangle,
    chip: "bg-tone-warm/12 text-tone-warm border-tone-warm/30",
    iconBg: "bg-gradient-to-br from-tone-warm to-tone-sla",
    bar: "from-tone-warm to-tone-sla",
    confidence: "bg-tone-warm",
  },
  info: {
    icon: Info,
    chip: "bg-tone-ai/12 text-tone-ai border-tone-ai/30",
    iconBg: "bg-gradient-to-br from-tone-ai to-bfresh-light-blue",
    bar: "from-tone-ai to-bfresh-light-blue",
    confidence: "bg-tone-ai",
  },
} as const;

const IMP_RANK = { high: 0, medium: 1, low: 2 } as const;

export function AICopilotRail({
  insights,
}: {
  insights: AIInsight[] | null | undefined;
}) {
  const list = Array.isArray(insights) ? insights.filter(Boolean) : [];
  return (
    <>
      {/* Desktop sticky rail */}
      <aside className="sticky top-[88px] hidden h-[calc(100vh-104px)] xl:block">
        <CopilotInner insights={list} />
      </aside>

      {/* Mobile + tablet FAB → Sheet */}
      <CopilotFab insights={list} />
    </>
  );
}

function CopilotInner({ insights }: { insights: AIInsight[] }) {
  const sorted = [...insights].sort(
    (a, b) =>
      (IMP_RANK[a.importance ?? "low"] ?? 9) -
      (IMP_RANK[b.importance ?? "low"] ?? 9),
  );

  // First high-importance insight becomes "Action of the Day"
  const featured = sorted.find((s) => s.importance === "high") ?? sorted[0];
  const rest = sorted.filter((s) => s.id !== featured?.id);

  return (
    <div className="premium-card flex h-full flex-col overflow-hidden p-0">
      <header className="border-border/50 flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="from-bfresh-blue to-bfresh-fresh-green grid size-10 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md shadow-bfresh-blue/30 ring-1 ring-white/30">
              <Sparkles className="size-4" />
            </div>
            <motion.span
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
              className="pointer-events-none from-bfresh-blue to-bfresh-fresh-green absolute inset-0 rounded-2xl bg-gradient-to-br"
            />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight">AI Copilot</h2>
            <p className="text-muted-foreground text-[11px]">
              מודיעין תפעולי בזמן אמת
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="border-bfresh-blue/30 bg-bfresh-blue/8 text-bfresh-blue gap-1 rounded-full text-[10px] font-black tracking-wider"
        >
          <Wand2 className="size-3" />
          BETA
        </Badge>
      </header>

      <div className="flex-1 overflow-y-auto">
        {featured && (
          <div className="border-border/50 border-b p-4">
            <div className="text-muted-foreground mb-2 text-[10px] font-black uppercase tracking-wider">
              פעולת היום
            </div>
            <CopilotInsight insight={featured} index={0} featured />
          </div>
        )}
        <div className="flex flex-col gap-2.5 p-4">
          {rest.length > 0 && (
            <div className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">
              תובנות נוספות
            </div>
          )}
          {rest.map((ins, i) => (
            <CopilotInsight insight={ins} index={i + 1} key={ins.id} />
          ))}
        </div>
      </div>

      <div className="border-border/50 flex items-center justify-between gap-2 border-t bg-muted/30 p-3 text-[11px]">
        <span className="text-muted-foreground inline-flex items-center gap-1.5 font-medium">
          <span className="relative inline-flex size-1.5 rounded-full bg-bfresh-fresh-green">
            <span className="absolute inset-0 animate-ping rounded-full bg-bfresh-fresh-green opacity-75" />
          </span>
          חוקים + סטטיסטיקה · {sorted.length} פעילות
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 rounded-lg text-[11px]"
        >
          הכל
          <ArrowLeft className="size-3" />
        </Button>
      </div>
    </div>
  );
}

function CopilotInsight({
  insight: ins,
  index,
  featured = false,
}: {
  insight: AIInsight;
  index: number;
  featured?: boolean;
}) {
  const [open, setOpen] = useState(featured);
  const meta = KIND_META[ins.kind];
  const Icon = meta.icon;
  const confidence = Math.round((ins.confidence ?? 0.85) * 100);
  const high = ins.importance === "high";

  return (
    <motion.article
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...SPRING_SMOOTH, delay: index * 0.05 }}
      className={cn(
        "premium-card relative overflow-hidden",
        featured ? "p-3.5" : "p-3",
        high && !featured && "ring-1 ring-bfresh-coral/20",
        featured && "ring-2 ring-bfresh-blue/20 shadow-md shadow-bfresh-blue/8",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 end-0 w-1 bg-gradient-to-b",
          meta.bar,
        )}
      />
      {high && (
        <motion.span
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="pointer-events-none absolute -inset-px rounded-[var(--radius-lg)] bg-bfresh-coral/4"
        />
      )}

      <div className="relative flex items-start gap-2.5">
        <div
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl text-white shadow-md ring-1 ring-white/30",
            meta.iconBg,
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {high && (
              <Badge
                variant="outline"
                className="rounded-full border-bfresh-coral/30 bg-bfresh-coral/10 text-[10px] font-black uppercase tracking-wider text-bfresh-coral"
              >
                עדיפות גבוהה
              </Badge>
            )}
            {ins.metric && (
              <span className="text-muted-foreground text-[10.5px] font-bold tabular-nums">
                {ins.metric}
              </span>
            )}
          </div>
          <div className="text-[13px] font-bold leading-snug">{ins.title}</div>
          <p className="text-muted-foreground text-[11.5px] leading-relaxed">
            {ins.detail}
          </p>
        </div>
      </div>

      <div className="relative mt-2.5">
        <div className="text-muted-foreground mb-1 flex items-center justify-between text-[9.5px] font-bold uppercase tracking-wider">
          <span>ביטחון</span>
          <span className="tabular-nums">{confidence}%</span>
        </div>
        <div className="bg-muted h-1 overflow-hidden rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.9, delay: index * 0.05 + 0.2 }}
            className={cn("h-full rounded-full", meta.confidence)}
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
            className="bg-muted/40 ring-border/40 relative mt-2 rounded-lg p-2.5 text-[11px] ring-1"
          >
            <div className="text-muted-foreground mb-1 flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wider">
              <Wand2 className="size-3" />
              המלצה לפעולה
            </div>
            <p className="text-foreground leading-relaxed">
              {ins.recommendation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {ins.recommendation && (
        <div className="relative mt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[10.5px] font-bold"
          >
            <ChevronRight
              className={cn(
                "size-3 transition-transform",
                open && "-rotate-90",
              )}
            />
            {open ? "הסתר המלצה" : "המלצה"}
          </button>
        </div>
      )}
    </motion.article>
  );
}

function CopilotFab({ insights }: { insights: AIInsight[] }) {
  const high = insights.filter((i) => i.importance === "high").length;
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            type="button"
            className="from-bfresh-blue to-bfresh-fresh-green shadow-bfresh-blue/40 fixed bottom-5 end-5 z-40 hidden h-12 items-center gap-2 rounded-full bg-gradient-to-l px-4 text-white shadow-xl ring-2 ring-white/30 hover:opacity-95 md:flex xl:hidden"
          />
        }
      >
        <Sparkles className="size-4" />
        Copilot
        {high > 0 && (
          <span className="ms-1 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-black text-bfresh-coral">
            {high}
          </span>
        )}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="bg-background border-border/60 w-[380px] p-0"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>AI Copilot</SheetTitle>
        </SheetHeader>
        <CopilotInner insights={insights} />
      </SheetContent>
    </Sheet>
  );
}
