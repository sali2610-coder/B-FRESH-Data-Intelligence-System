"use client";

import { motion } from "framer-motion";
import { Siren, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { fmtRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SPRING_SMOOTH, enterSlideEnd } from "@/lib/motion";
import type { ActivityEvent } from "@/types/domain";

const SEV_TONE: Record<
  string,
  { bar: string; text: string; chip: string; iconBg: string }
> = {
  critical: {
    bar: "from-rose-600 to-rose-500",
    text: "text-rose-700",
    chip: "bg-rose-500/15 text-rose-700 border-rose-500/30",
    iconBg: "bg-gradient-to-br from-rose-500 to-rose-600",
  },
  high: {
    bar: "from-orange-500 to-amber-500",
    text: "text-amber-700",
    chip: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
  },
  medium: {
    bar: "from-bfresh-blue to-sky-500",
    text: "text-bfresh-blue",
    chip: "bg-bfresh-blue/12 text-bfresh-blue border-bfresh-blue/30",
    iconBg: "bg-gradient-to-br from-bfresh-blue to-sky-500",
  },
};

const SEV_LABEL: Record<string, string> = {
  critical: "קריטי",
  high: "גבוה",
  medium: "בינוני",
};

export function UrgentAlertsRail({ events }: { events: ActivityEvent[] }) {
  const urgent = events.filter(
    (e) => e.severity === "critical" || e.severity === "high",
  );
  if (urgent.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_SMOOTH}
      className="premium-card relative overflow-hidden p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/30 ring-1 ring-white/30">
              <Siren className="size-4" />
            </div>
            <motion.span
              animate={{ scale: [1, 1.45, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="pointer-events-none absolute inset-0 rounded-xl bg-rose-500/50"
            />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight">
              דרוש מענה מיידי
            </h2>
            <p className="text-muted-foreground text-[11px]">
              {urgent.length} אירועים פתוחים · אינדיקציה תפעולית חיה
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px]">
          תור עדיפויות מלא
          <ArrowLeft className="size-3" />
        </Button>
      </div>

      <ScrollArea>
        <div className="flex gap-3 pb-2">
          {urgent.map((ev, i) => {
            const tone = SEV_TONE[ev.severity] ?? SEV_TONE.medium;
            return (
              <motion.button
                key={ev.id}
                type="button"
                variants={enterSlideEnd(i)}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -2 }}
                transition={SPRING_SMOOTH}
                className={cn(
                  "premium-card group relative flex w-[280px] shrink-0 flex-col gap-2 p-3 text-start",
                  "hover:shadow-lg",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none absolute inset-y-0 end-0 w-1 rounded-l-md bg-gradient-to-b",
                    tone.bar,
                  )}
                />
                <div className="flex items-start gap-2.5">
                  <div
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-xl text-white shadow-md ring-1 ring-white/20",
                      tone.iconBg,
                    )}
                  >
                    <ShieldAlert className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={cn(
                          "rounded-full border px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider",
                          tone.chip,
                        )}
                      >
                        {SEV_LABEL[ev.severity]}
                      </span>
                      <span className="text-muted-foreground text-[10px]">
                        {fmtRelative(ev.occurredAt)}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[13px] font-bold leading-snug">
                      {ev.title}
                    </div>
                    <div className="text-muted-foreground mt-0.5 truncate text-[11px]">
                      {ev.branchName} · {ev.ownerName}
                    </div>
                  </div>
                </div>
                {ev.action && (
                  <div className="flex justify-end">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-colors",
                        "bg-foreground/5 group-hover:bg-foreground group-hover:text-background",
                      )}
                    >
                      {ev.action.label}
                      <ArrowLeft className="size-3" />
                    </span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </motion.section>
  );
}
