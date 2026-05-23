"use client";

import { motion } from "framer-motion";
import { AlertOctagon, Bell, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { fmtDuration, fmtRelative } from "@/lib/format";
import type { SLAAlert } from "@/types/domain";

const SEV_META = {
  high: {
    label: "קריטי",
    badge: "bg-rose-500/15 text-rose-700 border-rose-500/30",
    ring: "ring-rose-500/30",
    pill: "bg-rose-500",
  },
  medium: {
    label: "בינוני",
    badge: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    ring: "ring-amber-500/30",
    pill: "bg-amber-500",
  },
  low: {
    label: "נמוך",
    badge: "bg-blue-500/15 text-blue-700 border-blue-500/30",
    ring: "ring-blue-500/30",
    pill: "bg-blue-500",
  },
} as const;

export function SLAAlerts({ alerts }: { alerts: SLAAlert[] }) {
  const high = alerts.filter((a) => a.severity === "high").length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-sm">
            <Bell className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold tracking-tight">
              התרעות SLA פעילות
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              משימות בחריגה — נדרשת התערבות
            </p>
          </div>
        </div>
        <Badge variant="outline" className="rounded-full">
          <span className="bg-rose-500 me-1.5 inline-block size-2 animate-pulse rounded-full" />
          {high} קריטי
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pe-3">
          <ul className="flex flex-col gap-2">
            {alerts.map((a, i) => {
              const meta = SEV_META[a.severity];
              return (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "group bg-muted/40 hover:bg-accent/40 relative flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors",
                  )}
                >
                  <span className={cn("size-2 rounded-full", meta.pill)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {a.taskTitle}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("rounded-full text-[10px]", meta.badge)}
                      >
                        {meta.label}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-[11px]">
                      <span>{a.branchName}</span>
                      <span>·</span>
                      <span>{a.assigneeName}</span>
                      <span>·</span>
                      <span>{fmtRelative(a.occurredAt)}</span>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-rose-600 flex items-center gap-1 text-xs font-bold">
                      <AlertOctagon className="size-3" />
                      {fmtDuration(a.minutesOverdue)}
                    </div>
                    <ChevronLeft className="text-muted-foreground ms-auto size-3.5 transition-transform group-hover:-translate-x-0.5" />
                  </div>
                </motion.li>
              );
            })}
            {alerts.length === 0 && (
              <li className="text-muted-foreground py-12 text-center text-sm">
                אין התרעות פעילות כרגע 🎉
              </li>
            )}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
