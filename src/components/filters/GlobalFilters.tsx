"use client";

import { useMemo } from "react";
import { Filter, RotateCcw, Calendar, Building2, User, ListChecks, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilters } from "@/lib/stores/filters";
import { cn } from "@/lib/utils";
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

  const activeCount = useMemo(
    () =>
      (branchId !== "all" ? 1 : 0) +
      (employeeId !== "all" ? 1 : 0) +
      (status !== "all" ? 1 : 0) +
      (slaState !== "all" ? 1 : 0) +
      (dateRange !== "30d" ? 1 : 0),
    [branchId, employeeId, status, slaState, dateRange],
  );

  return (
    <div className="elev-1 glass flex flex-row flex-wrap items-center gap-2 rounded-2xl p-2.5 md:gap-2">
      <div className="text-foreground flex items-center gap-1.5 ps-1.5 text-xs font-bold">
        <div className="from-bfresh-blue to-bfresh-fresh-green grid size-6 place-items-center rounded-lg bg-gradient-to-br text-white">
          <Filter className="size-3" />
        </div>
        <span className="hidden md:inline">סינון כללי</span>
        {activeCount > 0 && (
          <Badge className="bg-bfresh-blue text-white rounded-full h-5 px-1.5 text-[10px]">
            {activeCount}
          </Badge>
        )}
      </div>

      <FilterPill icon={Calendar}>
        <Select
          value={dateRange}
          onValueChange={(v) => v && setDateRange(v as never)}
        >
          <SelectTrigger className="h-8 w-28 rounded-lg border-0 bg-transparent shadow-none focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 ימים</SelectItem>
            <SelectItem value="30d">30 ימים</SelectItem>
            <SelectItem value="90d">90 ימים</SelectItem>
            <SelectItem value="ytd">מתחילת השנה</SelectItem>
          </SelectContent>
        </Select>
      </FilterPill>

      <FilterPill icon={Building2} active={branchId !== "all"}>
        <Select value={branchId} onValueChange={(v) => v && setBranchId(v)}>
          <SelectTrigger className="h-8 w-36 rounded-lg border-0 bg-transparent shadow-none focus:ring-0">
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
      </FilterPill>

      <FilterPill icon={User} active={employeeId !== "all"}>
        <Select value={employeeId} onValueChange={(v) => v && setEmployeeId(v)}>
          <SelectTrigger className="h-8 w-40 rounded-lg border-0 bg-transparent shadow-none focus:ring-0">
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
      </FilterPill>

      <FilterPill icon={ListChecks} active={status !== "all"}>
        <Select
          value={status}
          onValueChange={(v) => v && setStatus(v as never)}
        >
          <SelectTrigger className="h-8 w-32 rounded-lg border-0 bg-transparent shadow-none focus:ring-0">
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
      </FilterPill>

      <FilterPill icon={Gauge} active={slaState !== "all"}>
        <Select
          value={slaState}
          onValueChange={(v) => v && setSlaState(v as never)}
        >
          <SelectTrigger className="h-8 w-32 rounded-lg border-0 bg-transparent shadow-none focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל מצבי SLA</SelectItem>
            <SelectItem value="ok">תקין</SelectItem>
            <SelectItem value="at_risk">בסיכון</SelectItem>
            <SelectItem value="breached">חריגה</SelectItem>
          </SelectContent>
        </Select>
      </FilterPill>

      <Button
        variant="ghost"
        size="sm"
        onClick={reset}
        disabled={activeCount === 0}
        className={cn(
          "ms-auto h-8 gap-1 rounded-lg text-xs",
          activeCount > 0 && "text-bfresh-coral hover:bg-bfresh-coral/10 hover:text-bfresh-coral",
        )}
      >
        <RotateCcw className="size-3.5" />
        איפוס {activeCount > 0 && `(${activeCount})`}
      </Button>
    </div>
  );
}

function FilterPill({
  icon: Icon,
  active,
  children,
}: {
  icon: typeof Filter;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl border px-1.5 transition-colors",
        active
          ? "border-bfresh-blue/30 bg-bfresh-blue/8 text-bfresh-blue"
          : "border-border/60 bg-background/60",
      )}
    >
      <Icon className="size-3.5 opacity-70" />
      {children}
    </div>
  );
}
