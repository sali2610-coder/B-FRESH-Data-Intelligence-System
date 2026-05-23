"use client";

import { motion } from "framer-motion";
import { AlertOctagon, Bell, ChevronLeft, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { fmtDuration, fmtRelative } from "@/lib/format";
import type { SLAAlert } from "@/types/domain";

const SEV_META = {
  high: {
    label: "קריטי",
    badge: "bg-rose-500/15 text-rose-700 border-rose-500/30",
    pill: "bg-gradient-to-b from-rose-500 to-rose-600",
    glow: "shadow-rose-500/10",
    border: "hover:border-rose-500/40",
  },
  medium: {
    label: "בינוני",
    badge: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    pill: "bg-gradient-to-b from-amber-500 to-orange-500",
    glow: "shadow-amber-500/10",
    border: "hover:border-amber-500/40",
  },
  low: {
    label: "נמוך",
    badge: "bg-blue-500/15 text-blue-700 border-blue-500/30",
    pill: "bg-gradient-to-b from-blue-500 to-blue-600",
    glow: "shadow-blue-500/10",
    border: "hover:border-blue-500/40",
  },
} as const;

const SEV_RANK = { high: 0, medium: 1, low: 2 } as const;

export function SLAAlerts({ alerts }: { alerts: SLAAlert[] }) {
  const sorted = [...alerts].sort(
    (a, b) =>
      SEV_RANK[a.severity] - SEV_RANK[b.severity] ||
      b.minutesOverdue - a.minutesOverdue,
  );
  const high = alerts.filter((a) => a.severity === "high").length;

  return (
    <Card className="elev-1 flex h-full flex-col overflow-hidden border-border/60">
      <CardHeader className="flex-row items-center justify-between border-b border-border/50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/25">
            <Bell className="size-4" />
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
          className="bg-rose-500/8 border-rose-500/30 text-rose-700 rounded-full gap-1.5 py-1"
        >
          <span className="relative inline-flex size-2 rounded-full bg-rose-500">
            <span className="absolute inset-0 animate-ping rounded-full bg-rose-500 opacity-75" />
          </span>
          {high} קריטי
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[360px] px-4 py-3">
          <ul className="flex flex-col gap-2">
            {sorted.map((a, i) => {
              const meta = SEV_META[a.severity];
              return (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "group bg-card relative flex items-stretch gap-3 rounded-2xl border border-transparent p-3 transition-all",
                    "hover:bg-accent/30 hover:elev-1",
                    meta.border,
                    meta.glow,
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
                          "rounded-full text-[10px] uppercase tracking-wide",
                          meta.badge,
                        )}
                      >
                        {meta.label}
                      </Badge>
                      <span className="text-sm font-bold leading-tight truncate">
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
                    <div className="text-rose-600 inline-flex items-center gap-1 text-xs font-black tabular-nums">
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
                <ExternalLink className="size-6 opacity-30" />
                אין התרעות פעילות כרגע 🎉
              </li>
            )}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
