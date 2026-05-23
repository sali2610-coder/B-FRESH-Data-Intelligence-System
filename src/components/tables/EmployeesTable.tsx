"use client";

import { Crown, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fmtDuration, fmtNumber } from "@/lib/format";
import { useUI } from "@/lib/stores/ui";
import type { EmployeePerformance } from "@/types/domain";

export function EmployeesTable({ rows }: { rows: EmployeePerformance[] }) {
  const density = useUI((s) => s.density);
  const compact = density === "compact";
  const maxDone = Math.max(...rows.map((r) => r.done), 1);
  const rowPad = compact ? "py-2" : "py-3";

  return (
    <Card className="premium-card overflow-hidden border-0 bg-transparent shadow-none">
      <CardHeader className="border-border/50 flex-row items-center justify-between border-b pb-4">
        <div>
          <CardTitle className="text-base font-bold tracking-tight">
            ביצועי עובדים · רנקינג חי
          </CardTitle>
          <p className="text-muted-foreground text-xs">
            דירוג לפי משימות שהושלמו, עמידה ב-SLA וזמן טיפול ממוצע
          </p>
        </div>
        <Badge variant="outline" className="rounded-full font-bold">
          {rows.length} עובדים
        </Badge>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <div className="relative max-h-[520px] overflow-y-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-b from-muted/70 via-muted/55 to-muted/30 text-muted-foreground border-b border-border/60 text-start text-[10.5px] uppercase tracking-wider backdrop-blur-md">
                <th className={cn("ps-4 text-start font-bold", rowPad)}>#</th>
                <th className={cn("text-start font-bold", rowPad)}>עובד</th>
                <th className={cn("text-start font-bold", rowPad)}>סניף</th>
                <th className={cn("text-start font-bold", rowPad)}>פתוחות</th>
                <th className={cn("text-start font-bold", rowPad)}>הושלמו</th>
                <th className={cn("text-start font-bold", rowPad)}>זמן טיפול</th>
                <th className={cn("text-start font-bold", rowPad)}>SLA</th>
                <th className={cn("text-start font-bold", rowPad)}>מגמה</th>
                <th className={cn("pe-4 text-start font-bold", rowPad)}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <motion.tr
                  key={r.employeeId}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.025,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={cn(
                    "group border-b border-border/30 last:border-0 transition-colors",
                    i % 2 === 0 ? "bg-transparent" : "bg-muted/[0.18]",
                    "hover:bg-bfresh-blue/[0.04]",
                  )}
                >
                  <td className={cn("ps-4", rowPad)}>
                    <span
                      className={cn(
                        "grid size-8 place-items-center rounded-xl text-xs font-black tabular-nums",
                        i === 0
                          ? "bg-gradient-to-br from-tone-warm to-tone-warm text-white shadow-md shadow-tone-warm/30"
                          : i === 1
                            ? "bg-gradient-to-br from-zinc-300 to-zinc-400 text-white shadow-md shadow-zinc-400/30"
                            : i === 2
                              ? "bg-gradient-to-br from-tone-sla to-tone-sla text-white shadow-md shadow-orange-500/30"
                              : "bg-muted text-muted-foreground",
                      )}
                    >
                      {i === 0 ? <Crown className="size-3.5" /> : i + 1}
                    </span>
                  </td>
                  <td className={rowPad}>
                    <div className="flex items-center gap-3">
                      <span
                        className="grid size-9 place-items-center rounded-full text-sm font-black text-white shadow-md ring-2 ring-white"
                        style={{ backgroundColor: r.avatarColor }}
                      >
                        {r.name.slice(0, 1)}
                      </span>
                      <div className="leading-tight">
                        <div className="font-bold">{r.name}</div>
                        <div className="text-muted-foreground text-[11px]">
                          {r.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    className={cn(
                      "text-muted-foreground text-xs font-medium",
                      rowPad,
                    )}
                  >
                    {r.branchName}
                  </td>
                  <td className={cn("tabular-nums font-semibold", rowPad)}>
                    {fmtNumber(r.open)}
                  </td>
                  <td className={rowPad}>
                    <div className="flex items-center gap-3">
                      <span className="w-7 text-sm font-black tabular-nums">
                        {fmtNumber(r.done)}
                      </span>
                      <div className="bg-muted relative h-2 w-24 overflow-hidden rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(r.done / maxDone) * 100}%`,
                          }}
                          transition={{
                            duration: 0.8,
                            delay: i * 0.04,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="from-bfresh-blue to-bfresh-fresh-green absolute inset-y-0 start-0 rounded-full bg-gradient-to-l shadow-sm shadow-bfresh-blue/20"
                        />
                      </div>
                    </div>
                  </td>
                  <td className={cn("text-muted-foreground text-xs", rowPad)}>
                    {r.avgHandlingMinutes
                      ? fmtDuration(r.avgHandlingMinutes)
                      : "—"}
                  </td>
                  <td className={rowPad}>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full text-[11px] font-bold tabular-nums",
                        r.slaScore >= 85
                          ? "bg-bfresh-fresh-green/10 text-tone-success border-bfresh-fresh-green/25"
                          : r.slaScore >= 70
                            ? "bg-tone-warm/10 text-tone-warm border-tone-warm/25"
                            : "bg-bfresh-coral/10 text-bfresh-coral border-bfresh-coral/25",
                      )}
                    >
                      {r.slaScore}%
                    </Badge>
                  </td>
                  <td className={rowPad}>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-black tabular-nums",
                        r.trend >= 0
                          ? "bg-bfresh-fresh-green/10 text-tone-success"
                          : "bg-bfresh-coral/10 text-bfresh-coral",
                      )}
                    >
                      {r.trend >= 0 ? "▲" : "▼"} {Math.abs(r.trend)}%
                    </span>
                  </td>
                  <td className={cn("pe-4 text-end", rowPad)}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-bfresh-blue hover:bg-bfresh-blue/10 h-7 gap-1 rounded-lg px-2 text-[11px] font-bold opacity-0 transition-all -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100"
                    >
                      פרופיל
                      <ChevronLeft className="size-3" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
