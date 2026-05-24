"use client";

import { motion } from "framer-motion";
import { AlertOctagon, Bell, ChevronLeft, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { fmtDuration, fmtRelative } from "@/lib/format";
import { SPRING_SMOOTH, enterSlideEnd } from "@/lib/motion";
import type { SLAAlert } from "@/types/domain";

const SEV_META = {
  high: {
    label: "קריטי",
    badge: "bg-bfresh-coral/15 text-bfresh-coral border-bfresh-coral/30",
    pill: "bg-gradient-to-b from-bfresh-coral to-bfresh-coral-deep",
    hoverBg:
      "hover:bg-gradient-to-l hover:from-bfresh-coral/[0.08] hover:to-transparent",
  },
  medium: {
    label: "בינוני",
    badge: "bg-tone-warm/15 text-tone-warm border-tone-warm/30",
    pill: "bg-gradient-to-b from-tone-warm to-tone-sla",
    hoverBg:
      "hover:bg-gradient-to-l hover:from-tone-warm/[0.08] hover:to-transparent",
  },
  low: {
    label: "נמוך",
    badge: "bg-bfresh-blue/15 text-bfresh-blue border-bfresh-blue/30",
    pill: "bg-gradient-to-b from-bfresh-blue to-bfresh-light-blue",
    hoverBg:
      "hover:bg-gradient-to-l hover:from-bfresh-blue/[0.06] hover:to-transparent",
  },
} as const;

const SEV_RANK = { high: 0, medium: 1, low: 2 } as const;

export function SLAAlerts({
  alerts,
}: {
  alerts: SLAAlert[] | null | undefined;
}) {
  const list = Array.isArray(alerts) ? alerts.filter(Boolean) : [];
  const sorted = [...list].sort(
    (a, b) =>
      SEV_RANK[a.severity] - SEV_RANK[b.severity] ||
      b.minutesOverdue - a.minutesOverdue,
  );
  const high = list.filter((a) => a.severity === "high").length;

  return (
    <Card className="premium-card flex h-full flex-col overflow-hidden border-0 bg-transparent shadow-none">
      <CardHeader className="border-border/50 flex-row items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-bfresh-coral to-tone-warm text-white shadow-lg shadow-bfresh-coral/30 ring-1 ring-white/30">
              <Bell className="size-[18px]" />
            </div>
            <motion.span
              animate={{ scale: [1, 1.45, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 rounded-2xl bg-bfresh-coral/50"
            />
          </div>
          <div>
            <CardTitle className="text-base font-bold tracking-tight">
              תור עדיפויות · SLA
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              משימות בחריגה — נדרשת התערבות
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="bg-bfresh-coral/8 border-bfresh-coral/30 text-bfresh-coral gap-1.5 rounded-full py-1"
        >
          <span className="bg-bfresh-coral relative inline-flex size-2 rounded-full">
            <span className="bg-bfresh-coral absolute inset-0 animate-ping rounded-full opacity-75" />
          </span>
          <span className="tabular-nums">{high}</span> קריטי
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[380px] px-4 py-3">
          <ul className="flex flex-col gap-2">
            {sorted.map((a, i) => {
              const meta = SEV_META[a.severity];
              return (
                <motion.li
                  key={a.id}
                  variants={enterSlideEnd(i)}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ x: -3 }}
                  transition={SPRING_SMOOTH}
                  className={cn(
                    "group bg-card relative flex items-stretch gap-3 rounded-2xl border border-transparent p-3 transition-all duration-300",
                    "hover:border-border/60 hover:elev-1",
                    meta.hoverBg,
                  )}
                >
                  <span
                    className={cn(
                      "absolute inset-y-2 end-0 w-1 rounded-full",
                      meta.pill,
                    )}
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full text-[10px] uppercase tracking-wider",
                          meta.badge,
                        )}
                      >
                        {meta.label}
                      </Badge>
                      <span className="truncate text-sm font-bold leading-tight">
                        {a.taskTitle}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
                      <span className="font-medium">{a.branchName}</span>
                      <span>·</span>
                      <span>{a.assigneeName}</span>
                      <span>·</span>
                      <span>{fmtRelative(a.occurredAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-1">
                    <div className="text-bfresh-coral inline-flex items-center gap-1 text-xs font-black tabular-nums">
                      <AlertOctagon className="size-3" />
                      {fmtDuration(a.minutesOverdue)}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-bfresh-blue hover:bg-bfresh-blue/10 h-7 gap-1 rounded-lg px-2 text-[11px] font-bold opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      פתח
                      <ChevronLeft className="size-3" />
                    </Button>
                  </div>
                </motion.li>
              );
            })}
            {sorted.length === 0 && (
              <li className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm">
                <Inbox className="text-emerald-500 size-8 opacity-50" />
                <span className="font-bold">אין התרעות פעילות 🎉</span>
                <span className="text-xs">הרשת עומדת ביעדי השירות</span>
              </li>
            )}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
