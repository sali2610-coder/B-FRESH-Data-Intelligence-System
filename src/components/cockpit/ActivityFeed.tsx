"use client";

import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Megaphone,
  MessageSquare,
  Plug,
  UserPlus,
  Users,
  Wrench,
  ClipboardCheck,
  ArrowLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fmtRelative } from "@/lib/format";
import { SPRING_SMOOTH, enterFade } from "@/lib/motion";
import type { ActivityEvent, ActivityKind } from "@/types/domain";

const KIND_META: Record<
  ActivityKind,
  { icon: LucideIcon; label: string; ring: string }
> = {
  sla_breach: {
    icon: AlertTriangle,
    label: "חריגת SLA",
    ring: "text-rose-600 bg-rose-500/10 ring-rose-500/20",
  },
  complaint_opened: {
    icon: MessageSquare,
    label: "תלונה",
    ring: "text-amber-600 bg-amber-500/10 ring-amber-500/20",
  },
  complaint_closed: {
    icon: CheckCircle2,
    label: "תלונה נסגרה",
    ring: "text-emerald-600 bg-emerald-500/10 ring-emerald-500/20",
  },
  maintenance_call: {
    icon: Wrench,
    label: "אחזקה",
    ring: "text-violet-600 bg-violet-500/10 ring-violet-500/20",
  },
  technician_delay: {
    icon: Clock,
    label: "טכנאי באיחור",
    ring: "text-amber-600 bg-amber-500/10 ring-amber-500/20",
  },
  branch_outage: {
    icon: Plug,
    label: "סניף לא מקוון",
    ring: "text-rose-600 bg-rose-500/10 ring-rose-500/20",
  },
  marketing_launch: {
    icon: Megaphone,
    label: "שיווק",
    ring: "text-bfresh-blue bg-bfresh-blue/10 ring-bfresh-blue/20",
  },
  recruitment_spike: {
    icon: Users,
    label: "גיוס",
    ring: "text-cyan-600 bg-cyan-500/10 ring-cyan-500/20",
  },
  franchise_lead: {
    icon: UserPlus,
    label: "ליד זכיינות",
    ring: "text-emerald-600 bg-emerald-500/10 ring-emerald-500/20",
  },
  inspection_completed: {
    icon: ClipboardCheck,
    label: "ביקורת",
    ring: "text-bfresh-blue bg-bfresh-blue/10 ring-bfresh-blue/20",
  },
};

const SEV_DOT: Record<string, string> = {
  critical: "bg-rose-500",
  high: "bg-amber-500",
  medium: "bg-bfresh-blue",
  low: "bg-emerald-500",
  info: "bg-zinc-400",
};

export function ActivityFeed({
  events,
  height = 540,
}: {
  events: ActivityEvent[];
  height?: number;
}) {
  // group by day-bucket
  const buckets: { label: string; items: ActivityEvent[] }[] = [];
  const todayKey = new Date().toDateString();
  const yesterdayKey = new Date(Date.now() - 86400000).toDateString();
  const map = new Map<string, ActivityEvent[]>();
  events.forEach((e) => {
    const dKey = new Date(e.occurredAt).toDateString();
    const label =
      dKey === todayKey
        ? "היום"
        : dKey === yesterdayKey
          ? "אתמול"
          : new Date(e.occurredAt).toLocaleDateString("he-IL", {
              day: "numeric",
              month: "long",
            });
    const arr = map.get(label) ?? [];
    arr.push(e);
    map.set(label, arr);
  });
  for (const [label, items] of map) buckets.push({ label, items });

  return (
    <Card className="premium-card flex h-full flex-col overflow-hidden border-0 bg-transparent shadow-none">
      <CardHeader className="border-border/50 flex-row items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 text-white shadow-md ring-1 ring-white/20">
            <Activity className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold tracking-tight">
              פיד אירועים חי
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              סטרים מאוחד · CS · אחזקה · שיווק · גיוס
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="rounded-full gap-1.5 border-emerald-500/30 bg-emerald-500/8 text-emerald-700"
        >
          <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-75" />
          </span>
          חי
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea style={{ height }}>
          <div className="px-4 pb-4">
            {buckets.map((b, bi) => (
              <div key={b.label} className="relative">
                <div className="bg-gradient-to-b from-background/95 to-background/70 sticky top-0 z-10 -mx-4 mb-2 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground backdrop-blur-md">
                  {b.label}
                </div>
                <ul className="relative ms-2 space-y-2.5 border-s border-dashed border-border/60 ps-4">
                  {b.items.map((ev, i) => {
                    const meta = KIND_META[ev.kind];
                    const Icon = meta.icon;
                    return (
                      <motion.li
                        key={ev.id}
                        variants={enterFade(bi * 10 + i)}
                        initial="hidden"
                        animate="visible"
                        className="group relative"
                      >
                        <span
                          className={cn(
                            "absolute -start-[22px] top-2 grid size-7 place-items-center rounded-full ring-2 ring-background ring-offset-0 backdrop-blur-sm",
                            meta.ring,
                          )}
                        >
                          <Icon className="size-3.5" />
                        </span>
                        <motion.div
                          whileHover={{ x: -2 }}
                          transition={SPRING_SMOOTH}
                          className="bg-card hover:bg-accent/30 flex items-start gap-2 rounded-xl border border-transparent hover:border-border/60 p-2.5 transition-colors"
                        >
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "size-1.5 rounded-full",
                                  SEV_DOT[ev.severity],
                                )}
                              />
                              <span className="text-[13px] font-bold leading-tight">
                                {ev.title}
                              </span>
                            </div>
                            <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[11px]">
                              {ev.branchName && (
                                <span className="font-medium">
                                  {ev.branchName}
                                </span>
                              )}
                              {ev.ownerName && (
                                <>
                                  <span>·</span>
                                  <span>{ev.ownerName}</span>
                                </>
                              )}
                              <span>·</span>
                              <span>{fmtRelative(ev.occurredAt)}</span>
                            </div>
                            {ev.detail && (
                              <div className="text-muted-foreground/80 text-[11px] leading-snug">
                                {ev.detail}
                              </div>
                            )}
                          </div>
                          {ev.action && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-bfresh-blue hover:bg-bfresh-blue/10 h-7 shrink-0 gap-1 rounded-lg px-2 text-[11px] font-bold opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              {ev.action.label}
                              <ArrowLeft className="size-3" />
                            </Button>
                          )}
                        </motion.div>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
