"use client";

import { Crown, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fmtDuration, fmtNumber } from "@/lib/format";
import type { EmployeePerformance } from "@/types/domain";

export function EmployeesTable({ rows }: { rows: EmployeePerformance[] }) {
  const maxDone = Math.max(...rows.map((r) => r.done), 1);

  return (
    <Card className="elev-1 overflow-hidden border-border/60">
      <CardHeader className="flex-row items-center justify-between border-b border-border/50 pb-4">
        <div>
          <CardTitle className="text-base font-bold tracking-tight">
            ביצועי עובדים · רנקינג חי
          </CardTitle>
          <p className="text-muted-foreground text-xs">
            דירוג לפי משימות שהושלמו, עמידה ב-SLA וזמן טיפול ממוצע
          </p>
        </div>
        <Badge variant="outline" className="rounded-full">
          {rows.length} עובדים
        </Badge>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <div className="max-h-[520px] overflow-y-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/40 backdrop-blur-md sticky top-0 z-10">
              <tr className="text-muted-foreground border-b text-start text-[10.5px] uppercase tracking-wider">
                <th className="py-3 ps-4 text-start font-bold">#</th>
                <th className="py-3 text-start font-bold">עובד</th>
                <th className="py-3 text-start font-bold">סניף</th>
                <th className="py-3 text-start font-bold">פתוחות</th>
                <th className="py-3 text-start font-bold">הושלמו</th>
                <th className="py-3 text-start font-bold">זמן טיפול</th>
                <th className="py-3 text-start font-bold">SLA</th>
                <th className="py-3 text-start font-bold">מגמה</th>
                <th className="py-3 pe-4 text-start font-bold"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <motion.tr
                  key={r.employeeId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025 }}
                  className="hover:bg-accent/30 group border-b border-border/40 last:border-0 transition-colors"
                >
                  <td className="py-3 ps-4">
                    <span
                      className={cn(
                        "grid size-8 place-items-center rounded-xl text-xs font-black tabular-nums",
                        i === 0
                          ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md shadow-amber-500/30"
                          : i === 1
                            ? "bg-gradient-to-br from-zinc-300 to-zinc-400 text-white shadow-md shadow-zinc-400/30"
                            : i === 2
                              ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md shadow-orange-500/30"
                              : "bg-muted text-muted-foreground",
                      )}
                    >
                      {i === 0 ? <Crown className="size-3.5" /> : i + 1}
                    </span>
                  </td>
                  <td className="py-3">
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
                  <td className="text-muted-foreground py-3 text-xs font-medium">
                    {r.branchName}
                  </td>
                  <td className="py-3 tabular-nums font-semibold">
                    {fmtNumber(r.open)}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black tabular-nums w-7">
                        {fmtNumber(r.done)}
                      </span>
                      <div className="bg-muted relative h-2 w-24 overflow-hidden rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(r.done / maxDone) * 100}%`,
                          }}
                          transition={{ duration: 0.6, delay: i * 0.04 }}
                          className="from-bfresh-blue to-bfresh-fresh-green absolute inset-y-0 start-0 rounded-full bg-gradient-to-l"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="text-muted-foreground py-3 text-xs">
                    {r.avgHandlingMinutes
                      ? fmtDuration(r.avgHandlingMinutes)
                      : "—"}
                  </td>
                  <td className="py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full text-[11px] font-bold tabular-nums",
                        r.slaScore >= 85
                          ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/25"
                          : r.slaScore >= 70
                            ? "bg-amber-500/10 text-amber-700 border-amber-500/25"
                            : "bg-rose-500/10 text-rose-700 border-rose-500/25",
                      )}
                    >
                      {r.slaScore}%
                    </Badge>
                  </td>
                  <td className="py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-black tabular-nums",
                        r.trend >= 0
                          ? "bg-emerald-500/10 text-emerald-700"
                          : "bg-rose-500/10 text-rose-700",
                      )}
                    >
                      {r.trend >= 0 ? "▲" : "▼"} {Math.abs(r.trend)}%
                    </span>
                  </td>
                  <td className="py-3 pe-4 text-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-bfresh-blue hover:bg-bfresh-blue/10 h-7 gap-1 rounded-lg px-2 text-[11px] font-bold opacity-0 transition-opacity group-hover:opacity-100"
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
