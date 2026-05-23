"use client";

import { Crown } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fmtDuration, fmtNumber } from "@/lib/format";
import type { EmployeePerformance } from "@/types/domain";

export function EmployeesTable({ rows }: { rows: EmployeePerformance[] }) {
  const maxDone = Math.max(...rows.map((r) => r.done), 1);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold tracking-tight">
            ביצועי עובדים
          </CardTitle>
          <p className="text-muted-foreground text-xs">
            דירוג לפי משימות שהושלמו, עמידה ב-SLA וזמן טיפול ממוצע
          </p>
        </div>
        <Badge variant="outline" className="rounded-full">
          {rows.length} עובדים
        </Badge>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-muted-foreground border-b text-start text-[11px] uppercase tracking-wide">
              <th className="py-2 ps-2 text-start font-medium">#</th>
              <th className="py-2 text-start font-medium">עובד</th>
              <th className="py-2 text-start font-medium">סניף</th>
              <th className="py-2 text-start font-medium">פתוחות</th>
              <th className="py-2 text-start font-medium">הושלמו</th>
              <th className="py-2 text-start font-medium">זמן טיפול</th>
              <th className="py-2 text-start font-medium">SLA</th>
              <th className="py-2 pe-2 text-start font-medium">מגמה</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <motion.tr
                key={r.employeeId}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="hover:bg-accent/30 border-b last:border-0"
              >
                <td className="py-3 ps-2">
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-lg text-xs font-bold",
                      i === 0
                        ? "bg-amber-500/20 text-amber-700"
                        : i === 1
                          ? "bg-zinc-300/30 text-zinc-700"
                          : i === 2
                            ? "bg-orange-500/15 text-orange-700"
                            : "bg-muted text-muted-foreground",
                    )}
                  >
                    {i === 0 ? <Crown className="size-3.5" /> : i + 1}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="grid size-8 place-items-center rounded-full text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: r.avatarColor }}
                    >
                      {r.name.slice(0, 1)}
                    </span>
                    <div className="leading-tight">
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-muted-foreground text-[11px]">
                        {r.role}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="text-muted-foreground py-3 text-xs">
                  {r.branchName}
                </td>
                <td className="py-3 tabular-nums">{fmtNumber(r.open)}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tabular-nums">
                      {fmtNumber(r.done)}
                    </span>
                    <div className="bg-muted relative h-1.5 w-20 overflow-hidden rounded-full">
                      <div
                        className="from-bfresh-blue to-bfresh-fresh-green absolute inset-y-0 start-0 rounded-full bg-gradient-to-l"
                        style={{ width: `${(r.done / maxDone) * 100}%` }}
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
                      "rounded-full",
                      r.slaScore >= 85
                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                        : r.slaScore >= 70
                          ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-700 border-rose-500/20",
                    )}
                  >
                    {r.slaScore}%
                  </Badge>
                </td>
                <td className="py-3 pe-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
                      r.trend >= 0
                        ? "bg-emerald-500/10 text-emerald-700"
                        : "bg-rose-500/10 text-rose-700",
                    )}
                  >
                    {r.trend >= 0 ? "▲" : "▼"} {Math.abs(r.trend)}%
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
