"use client";

import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilters } from "@/lib/stores/filters";
import type { Branch, Employee } from "@/types/domain";

export function GlobalFilters({
  branches,
  employees,
}: {
  branches: Branch[];
  employees: Employee[];
}) {
  const {
    dateRange,
    branchId,
    employeeId,
    status,
    slaState,
    setDateRange,
    setBranchId,
    setEmployeeId,
    setStatus,
    setSlaState,
    reset,
  } = useFilters();

  return (
    <Card className="flex flex-row flex-wrap items-center gap-2 p-3 md:gap-3">
      <div className="text-muted-foreground hidden items-center gap-1.5 text-xs font-medium md:flex">
        <Filter className="size-3.5" />
        סינון כללי
      </div>

      <Select value={dateRange} onValueChange={(v) => v && setDateRange(v as never)}>
        <SelectTrigger className="h-9 w-32 rounded-lg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">7 ימים</SelectItem>
          <SelectItem value="30d">30 ימים</SelectItem>
          <SelectItem value="90d">90 ימים</SelectItem>
          <SelectItem value="ytd">מתחילת השנה</SelectItem>
        </SelectContent>
      </Select>

      <Select value={branchId} onValueChange={(v) => v && setBranchId(v)}>
        <SelectTrigger className="h-9 w-36 rounded-lg">
          <SelectValue placeholder="כל הסניפים" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הסניפים</SelectItem>
          {branches.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={employeeId} onValueChange={(v) => v && setEmployeeId(v)}>
        <SelectTrigger className="h-9 w-40 rounded-lg">
          <SelectValue placeholder="כל העובדים" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל העובדים</SelectItem>
          {employees.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => v && setStatus(v as never)}>
        <SelectTrigger className="h-9 w-32 rounded-lg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הסטטוסים</SelectItem>
          <SelectItem value="open">פתוח</SelectItem>
          <SelectItem value="in_progress">בטיפול</SelectItem>
          <SelectItem value="blocked">חסום</SelectItem>
          <SelectItem value="done">הושלם</SelectItem>
        </SelectContent>
      </Select>

      <Select value={slaState} onValueChange={(v) => v && setSlaState(v as never)}>
        <SelectTrigger className="h-9 w-32 rounded-lg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל מצבי SLA</SelectItem>
          <SelectItem value="ok">תקין</SelectItem>
          <SelectItem value="at_risk">בסיכון</SelectItem>
          <SelectItem value="breached">חריגה</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        onClick={reset}
        className="ms-auto h-9 gap-1 text-xs"
      >
        <RotateCcw className="size-3.5" />
        איפוס
      </Button>
    </Card>
  );
}
