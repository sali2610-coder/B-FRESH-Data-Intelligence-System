"use client";

import { useMemo, useState } from "react";
import {
  MessageSquare,
  Filter,
  RotateCcw,
  ListChecks,
  Gauge,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState } from "@/components/dashboard/ErrorState";
import { ComplaintsTable } from "@/components/tables/ComplaintsTable";
import { useComplaints, type ComplaintsFilters } from "@/hooks/useComplaints";
import { cn } from "@/lib/utils";

export default function ComplaintsClient() {
  const [filters, setFilters] = useState<ComplaintsFilters>({});
  const { data, isLoading, isError, refetch } = useComplaints(filters);

  const activeCount = useMemo(
    () =>
      Object.values(filters).filter((v) => v && v !== "all").length,
    [filters],
  );

  if (isError) {
    return (
      <Card className="p-8">
        <ErrorState
          message="לא ניתן לטעון תלונות"
          onRetry={() => refetch()}
        />
      </Card>
    );
  }

  const employees = data?.employees ?? [];
  const ownerOptions = employees.map((e) => ({ id: e.id, name: e.name }));

  return (
    <div className="flex flex-col gap-[var(--density-section-gap,1.5rem)]">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="from-bfresh-blue to-bfresh-light-blue grid size-10 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md shadow-bfresh-blue/30 ring-1 ring-white/30">
              <MessageSquare className="size-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              תלונות לקוחות
            </h1>
            {data && (
              <Badge variant="outline" className="rounded-full">
                {data.total} סה״כ
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            תור תפעולי חי מבורד Monday · {data?.source === "live" ? "Live" : "Mock"}
          </p>
        </div>
      </header>

      {/* Filter bar */}
      <div className="premium-card flex flex-row flex-wrap items-center gap-2 rounded-2xl p-2.5">
        <div className="text-foreground flex items-center gap-1.5 ps-1.5 text-xs font-bold">
          <div className="from-bfresh-blue to-bfresh-fresh-green grid size-6 place-items-center rounded-lg bg-gradient-to-br text-white">
            <Filter className="size-3" />
          </div>
          <span className="hidden md:inline">סינון</span>
          {activeCount > 0 && (
            <Badge className="bg-bfresh-blue text-white rounded-full h-5 px-1.5 text-[10px]">
              {activeCount}
            </Badge>
          )}
        </div>

        <FilterPill icon={ListChecks} active={!!filters.status && filters.status !== "all"}>
          <Select
            value={filters.status ?? "all"}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, status: v && v !== "all" ? v : undefined }))
            }
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

        <FilterPill icon={Gauge} active={!!filters.slaState && filters.slaState !== "all"}>
          <Select
            value={filters.slaState ?? "all"}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, slaState: v && v !== "all" ? v : undefined }))
            }
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

        <FilterPill icon={User} active={!!filters.owner && filters.owner !== "all"}>
          <Select
            value={filters.owner ?? "all"}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, owner: v && v !== "all" ? v : undefined }))
            }
          >
            <SelectTrigger className="h-8 w-44 rounded-lg border-0 bg-transparent shadow-none focus:ring-0">
              <SelectValue placeholder="כל האחראים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל האחראים</SelectItem>
              {ownerOptions.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterPill>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilters({})}
          disabled={activeCount === 0}
          className={cn(
            "ms-auto h-8 gap-1 rounded-lg text-xs",
            activeCount > 0 &&
              "text-bfresh-coral hover:bg-bfresh-coral/10 hover:text-bfresh-coral",
          )}
        >
          <RotateCcw className="size-3.5" />
          איפוס {activeCount > 0 && `(${activeCount})`}
        </Button>
      </div>

      {isLoading || !data ? (
        <Skeleton className="h-[480px] rounded-2xl" />
      ) : (
        <ComplaintsTable
          complaints={data.complaints}
          employees={data.employees}
        />
      )}
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
