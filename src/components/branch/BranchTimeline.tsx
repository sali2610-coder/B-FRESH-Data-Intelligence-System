"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Megaphone,
  MessageSquare,
  StickyNote,
  UserPlus,
  Users,
  Wrench,
  Plug,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { fmtDate, fmtRelative } from "@/lib/format";
import { enterFade } from "@/lib/motion";
import type { BranchTimelineItem } from "@/types/domain";

const KIND_ICON: Record<string, LucideIcon> = {
  sla_breach: AlertTriangle,
  complaint_opened: MessageSquare,
  complaint_closed: CheckCircle2,
  maintenance_call: Wrench,
  technician_delay: Clock,
  branch_outage: Plug,
  marketing_launch: Megaphone,
  recruitment_spike: Users,
  franchise_lead: UserPlus,
  inspection_completed: ClipboardCheck,
  inspection: ClipboardCheck,
  note: StickyNote,
};

const SEV_RING: Record<string, string> = {
  critical: "bg-rose-500/15 text-rose-700 ring-rose-500/30",
  high: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
  medium: "bg-bfresh-blue/12 text-bfresh-blue ring-bfresh-blue/30",
  low: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30",
  info: "bg-zinc-400/15 text-zinc-700 ring-zinc-400/30",
};

export function BranchTimeline({ items }: { items: BranchTimelineItem[] }) {
  return (
    <Card className="premium-card overflow-hidden border-0 bg-transparent shadow-none">
      <CardHeader className="border-border/50 border-b pb-4">
        <CardTitle className="text-base font-bold tracking-tight">
          ציר זמן · פעילות סניף
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          ארועים אחרונים מכל המחלקות
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[480px]">
          <ol className="relative ms-6 my-4 me-4 space-y-3 border-s border-dashed border-border/60 ps-4">
            {items.map((it, i) => {
              const Icon = KIND_ICON[it.kind] ?? StickyNote;
              const ring = SEV_RING[it.severity ?? "info"] ?? SEV_RING.info;
              return (
                <motion.li
                  key={it.id}
                  variants={enterFade(i)}
                  initial="hidden"
                  animate="visible"
                  className="group relative"
                >
                  <span
                    className={cn(
                      "absolute -start-[24px] top-1.5 grid size-8 place-items-center rounded-full ring-2 ring-background backdrop-blur-sm",
                      ring,
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <div className="bg-card hover:bg-accent/30 rounded-xl border border-transparent hover:border-border/60 p-3 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold leading-snug">
                          {it.title}
                        </div>
                        {it.detail && (
                          <div className="text-muted-foreground mt-0.5 text-[11px]">
                            {it.detail}
                          </div>
                        )}
                      </div>
                      <div className="text-muted-foreground shrink-0 text-end text-[10.5px] leading-tight">
                        <div>{fmtRelative(it.occurredAt)}</div>
                        <div className="font-medium">
                          {fmtDate(it.occurredAt, "d/M HH:mm")}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
