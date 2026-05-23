"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/health";
import { SPRING_SMOOTH, enterUp } from "@/lib/motion";
import type { BranchHealth } from "@/types/domain";

const REGION_LABEL: Record<string, string> = {
  north: "צפון",
  center: "מרכז",
  south: "דרום",
};

export function NetworkHeatmap({
  branches,
}: {
  branches: BranchHealth[];
}) {
  const sorted = [...branches].sort((a, b) => b.score - a.score);
  const byStatus = {
    excellent: branches.filter((b) => b.status === "excellent").length,
    stable: branches.filter((b) => b.status === "stable").length,
    attention: branches.filter((b) => b.status === "attention").length,
    critical: branches.filter((b) => b.status === "critical").length,
  };

  return (
    <Card className="premium-card overflow-hidden border-0 bg-transparent shadow-none">
      <CardHeader className="border-border/50 flex-row items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="from-bfresh-blue to-bfresh-fresh-green grid size-10 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md ring-1 ring-white/30">
            <MapPin className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold tracking-tight">
              היטמפ הרשת · {branches.length} סניפים
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              סטטוס תפעולי לפי ציון בריאות
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {(["excellent", "stable", "attention", "critical"] as const).map(
            (k) => (
              <Badge
                key={k}
                variant="outline"
                className={cn(
                  "rounded-full text-[10px] font-bold",
                  STATUS_TONE[k].chip,
                )}
              >
                <span
                  className={cn("me-1 size-1.5 rounded-full", STATUS_TONE[k].dot)}
                />
                {byStatus[k]} {STATUS_LABEL[k]}
              </Badge>
            ),
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-4">
          {sorted.map((b, i) => {
            const tone = STATUS_TONE[b.status];
            return (
              <motion.div
                key={b.branchId}
                variants={enterUp(i)}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -3 }}
                transition={SPRING_SMOOTH}
              >
                <Link
                  href={`/branches/${b.branchId}`}
                  className={cn(
                    "premium-card group relative block overflow-hidden p-3 transition-shadow",
                    `glow-${b.status === "excellent" ? "green" : b.status === "stable" ? "blue" : b.status === "attention" ? "amber" : "rose"}`,
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l",
                      b.status === "excellent"
                        ? "from-emerald-500 to-bfresh-fresh-green"
                        : b.status === "stable"
                          ? "from-bfresh-blue to-sky-400"
                          : b.status === "attention"
                            ? "from-amber-500 to-orange-400"
                            : "from-rose-500 to-pink-400",
                    )}
                  />
                  {b.status === "critical" && (
                    <motion.span
                      animate={{ opacity: [0.4, 0.85, 0.4] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                      className="pointer-events-none absolute inset-0 rounded-[var(--radius-lg)] bg-rose-500/8"
                    />
                  )}
                  <div className="relative flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold">
                        {b.branchName}
                      </div>
                      <div className="text-muted-foreground text-[10.5px] font-medium">
                        {REGION_LABEL[b.region]} · {b.manager}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        tone.dot,
                        b.status === "critical" && "animate-pulse",
                      )}
                    />
                  </div>
                  <div className="relative mt-3 flex items-end justify-between">
                    <div>
                      <div className="text-[26px] font-black leading-none tabular-nums">
                        {b.score}
                      </div>
                      <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                        ציון
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                          tone.chip,
                        )}
                      >
                        {STATUS_LABEL[b.status]}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums",
                          b.trend >= 0 ? "text-emerald-700" : "text-rose-700",
                        )}
                      >
                        {b.trend >= 0 ? "▲" : "▼"} {Math.abs(b.trend)}%
                      </span>
                    </div>
                  </div>
                  {b.movement !== 0 && (
                    <div className="text-muted-foreground relative mt-1.5 flex items-center gap-1 text-[10px]">
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-black tabular-nums",
                          b.movement > 0
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "bg-rose-500/10 text-rose-700",
                        )}
                      >
                        {b.movement > 0 ? "▲" : "▼"} {Math.abs(b.movement)}
                      </span>
                      <span>בדירוג</span>
                    </div>
                  )}
                  <ArrowLeft className="text-bfresh-blue absolute end-3 bottom-3 size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
