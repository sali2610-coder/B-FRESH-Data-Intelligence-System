"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { NetworkHeatmap } from "@/components/cockpit/NetworkHeatmap";
import { ErrorState } from "@/components/dashboard/ErrorState";
import { useDashboard } from "@/hooks/useDashboard";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/health";
import { cn } from "@/lib/utils";
import type { BranchStatus } from "@/types/domain";

const STATUSES: ("all" | BranchStatus)[] = [
  "all",
  "excellent",
  "stable",
  "attention",
  "critical",
];

export default function BranchesGridClient() {
  const { data, isLoading, isError, refetch } = useDashboard();
  const [filter, setFilter] = useState<"all" | BranchStatus>("all");

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data.branchHealth;
    return data.branchHealth.filter((b) => b.status === filter);
  }, [data, filter]);

  if (isError) {
    return (
      <Card className="p-8">
        <ErrorState onRetry={() => refetch()} />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--density-section-gap,1.5rem)]">
      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
          רשת הסניפים · אינטליגנציה תפעולית
        </h1>
        <p className="text-muted-foreground text-sm">
          סטטוס בריאות חי לכל סניף ברשת. לחץ על סניף לפרופיל 360°.
        </p>
      </header>

      {/* Status filter pills */}
      {data && (
        <div className="flex flex-wrap items-center gap-2">
          {STATUSES.map((s) => {
            const count =
              s === "all"
                ? data.branchHealth.length
                : data.branchHealth.filter((b) => b.status === s).length;
            const tone = s === "all" ? null : STATUS_TONE[s as BranchStatus];
            return (
              <Button
                key={s}
                size="sm"
                variant={filter === s ? "default" : "outline"}
                onClick={() => setFilter(s)}
                className={cn(
                  "h-9 rounded-full px-3 gap-1.5 text-xs font-bold",
                  filter === s
                    ? "from-bfresh-blue to-bfresh-fresh-green bg-gradient-to-l text-white"
                    : "",
                )}
              >
                {tone && (
                  <span className={cn("size-1.5 rounded-full", tone.dot)} />
                )}
                {s === "all" ? "הכל" : STATUS_LABEL[s as BranchStatus]}
                <Badge
                  variant="secondary"
                  className={cn(
                    "rounded-full px-1.5 text-[10px] tabular-nums",
                    filter === s && "bg-white/20 text-white",
                  )}
                >
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>
      )}

      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <NetworkHeatmap branches={filtered} />
      )}
    </div>
  );
}
