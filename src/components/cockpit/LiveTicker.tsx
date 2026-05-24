"use client";

import { Radio, AlertOctagon, Wrench, MessageSquare, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { fmtRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ActivityEvent, ActivityKind } from "@/types/domain";

const KIND_ICON: Partial<Record<ActivityKind, LucideIcon>> = {
  sla_breach: AlertOctagon,
  complaint_opened: MessageSquare,
  maintenance_call: Wrench,
  franchise_lead: UserPlus,
};

const SEV_TONE: Record<string, string> = {
  critical: "text-bfresh-coral",
  high: "text-tone-warm",
  medium: "text-bfresh-blue",
  low: "text-tone-success",
  info: "text-muted-foreground",
};

export function LiveTicker({
  events,
}: {
  events: ActivityEvent[] | null | undefined;
}) {
  const list = Array.isArray(events) ? events : [];
  const items = list.filter(
    (e) =>
      e &&
      (e.severity === "critical" ||
        e.severity === "high" ||
        e.kind === "franchise_lead" ||
        e.kind === "maintenance_call"),
  );
  if (items.length === 0) return null;

  // Duplicate sequence for seamless marquee loop
  const loop = [...items, ...items];

  return (
    <div
      className={cn(
        "premium-card ticker-mask relative flex h-10 items-center overflow-hidden rounded-full px-3",
      )}
      aria-label="טיקר חי"
    >
      <div className="bg-gradient-to-l from-bfresh-blue to-bfresh-light-blue text-white me-3 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wider shadow-md shadow-bfresh-blue/30">
        <span className="relative inline-flex size-1.5 rounded-full bg-white">
          <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-75" />
        </span>
        <Radio className="size-3" />
        Live
      </div>
      <div className="ticker-flow gap-8">
        {loop.map((e, i) => {
          const Icon = KIND_ICON[e.kind];
          return (
            <span
              key={`${e.id}-${i}`}
              className="inline-flex items-center gap-2 whitespace-nowrap text-[12px]"
            >
              {Icon && (
                <Icon className={cn("size-3.5", SEV_TONE[e.severity])} />
              )}
              <span className={cn("font-bold", SEV_TONE[e.severity])}>
                {e.title}
              </span>
              {e.branchName && (
                <span className="text-muted-foreground">{e.branchName}</span>
              )}
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                {fmtRelative(e.occurredAt)}
              </span>
              <span className="text-muted-foreground/40 mx-2">•</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
