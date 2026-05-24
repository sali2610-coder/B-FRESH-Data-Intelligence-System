"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/health";
import {
  getBranchStatus,
  getStatusLabel,
  getStatusTone,
  safeArray,
  safeNumber,
  safeText,
} from "@/lib/safe";
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
  branches: BranchHealth[] | null | undefined;
}) {
  const safeBranches = safeArray(branches).filter(
    (b) => b && typeof b === "object",
  );
  const sorted = [...safeBranches].sort(
    (a, b) => safeNumber(b.score) - safeNumber(a.score),
  );
  const byStatus = {
    excellent: safeBranches.filter((b) => getBranchStatus(b) === "excellent").length,
    stable: safeBranches.filter((b) => getBranchStatus(b) === "stable").length,
    attention: safeBranches.filter((b) => getBranchStatus(b) === "attention").length,
    critical: safeBranches.filter((b) => getBranchStatus(b) === "critical").length,
  };

  return (
    <Card className="premium-card relative overflow-hidden border-0 bg-transparent shadow-none">
      {/* Network pulse waveform under header — continuous motion */}
      <svg
        aria-hidden
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-12 h-14 w-full opacity-30"
      >
        <defs>
          <linearGradient id="netpulse" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#12a9e8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M0,40 C150,10 300,70 450,40 C600,10 750,70 900,40 C1050,10 1200,70 1200,40"
          fill="none"
          stroke="url(#netpulse)"
          strokeWidth="1.2"
          className="pulse-line"
        />
      </svg>
      <CardHeader className="border-border/50 relative flex-row items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="from-bfresh-blue to-bfresh-fresh-green grid size-10 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md ring-1 ring-white/30">
            <MapPin className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold tracking-tight">
              היטמפ הרשת · {safeBranches.length} סניפים
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
          {sorted.length === 0 && (
            <div className="text-muted-foreground col-span-full rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm">
              אין נתוני סניפים זמינים עדיין · ממתין לעמודת סניף ב-Monday
            </div>
          )}
          {sorted.map((b, i) => {
            const status = getBranchStatus(b);
            const tone = getStatusTone(status);
            const branchId = safeText(b?.branchId, "");
            const branchName = safeText(b?.branchName);
            const region = b?.region ?? "center";
            const manager = safeText(b?.manager);
            const score = safeNumber(b?.score);
            const trend = safeNumber(b?.trend);
            const movement = safeNumber(b?.movement);
            return (
              <motion.div
                key={branchId || i}
                variants={enterUp(i)}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -3 }}
                transition={SPRING_SMOOTH}
              >
                <Link
                  href={branchId ? `/branches/${branchId}` : "#"}
                  className={cn(
                    "premium-card group relative block overflow-hidden p-3 transition-shadow",
                    status === "excellent"
                      ? "glow-success"
                      : status === "stable"
                        ? "glow-network"
                        : status === "attention"
                          ? "glow-amber"
                          : "glow-critical",
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l",
                      status === "excellent"
                        ? "from-bfresh-fresh-green to-bfresh-light-blue"
                        : status === "stable"
                          ? "from-bfresh-blue to-bfresh-light-blue"
                          : status === "attention"
                            ? "from-tone-warm to-tone-sla"
                            : "from-bfresh-coral to-bfresh-coral-deep",
                    )}
                  />
                  {status === "critical" && (
                    <motion.span
                      animate={{ opacity: [0.4, 0.85, 0.4] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                      className="bg-bfresh-coral/8 pointer-events-none absolute inset-0 rounded-[var(--radius-lg)]"
                    />
                  )}
                  <div className="relative flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold">
                        {branchName}
                      </div>
                      <div className="text-muted-foreground text-[10.5px] font-medium">
                        {REGION_LABEL[region] ?? "—"} · {manager}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        tone.dot,
                        status === "critical" && "animate-pulse",
                      )}
                    />
                  </div>
                  <div className="relative mt-3 flex items-end justify-between">
                    <div>
                      <div className="text-[26px] font-black leading-none tabular-nums">
                        {score || "—"}
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
                        {getStatusLabel(status)}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums",
                          trend >= 0
                            ? "text-tone-success"
                            : "text-bfresh-coral",
                        )}
                      >
                        {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
                      </span>
                    </div>
                  </div>
                  {movement !== 0 && (
                    <div className="text-muted-foreground relative mt-1.5 flex items-center gap-1 text-[10px]">
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-black tabular-nums",
                          movement > 0
                            ? "bg-bfresh-fresh-green/10 text-tone-success"
                            : "bg-bfresh-coral/10 text-bfresh-coral",
                        )}
                      >
                        {movement > 0 ? "▲" : "▼"} {Math.abs(movement)}
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
