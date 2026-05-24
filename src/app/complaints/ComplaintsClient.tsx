"use client";

import { useMemo, useState } from "react";
import {
  MessageSquare,
  Filter,
  RotateCcw,
  ListChecks,
  Gauge,
  User,
  Download,
  Bookmark,
  BookmarkCheck,
  Trash2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ErrorState } from "@/components/dashboard/ErrorState";
import { ComplaintsTable } from "@/components/tables/ComplaintsTable";
import { ComplaintDrillPanel } from "@/components/cockpit/ComplaintDrillPanel";
import { OwnerDrillPanel } from "@/components/cockpit/OwnerDrillPanel";
import { useComplaints, type ComplaintsFilters } from "@/hooks/useComplaints";
import { useSavedViews } from "@/lib/stores/savedViews";
import { downloadCsv, toCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ComplaintEntity } from "@/domain";

const SCOPE = "complaints";

export default function ComplaintsClient() {
  const [filters, setFilters] = useState<ComplaintsFilters>({});
  const { data, isLoading, isError, refetch } = useComplaints(filters);
  const [drillComplaint, setDrillComplaint] = useState<ComplaintEntity | null>(
    null,
  );
  const [drillOwner, setDrillOwner] = useState<string | null>(null);

  const savedViews = useSavedViews((s) => s.views).filter(
    (v) => v.scope === SCOPE,
  );
  const addView = useSavedViews((s) => s.add);
  const removeView = useSavedViews((s) => s.remove);

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

  const handleExport = () => {
    if (!data?.complaints?.length) {
      toast.error("אין מה לייצא");
      return;
    }
    const empMap = new Map(employees.map((e) => [e.id, e.name]));
    const rows = data.complaints.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      secondaryStatus: c.secondaryStatus ?? "",
      slaState: c.slaState,
      priority: c.priority,
      assignee: c.assigneeId ? (empMap.get(c.assigneeId) ?? c.assigneeId) : "",
      createdAt: c.createdAt,
      dueAt: c.dueAt ?? "",
      resolvedAt: c.resolvedAt ?? "",
      handlingMinutes: c.handlingMinutes ?? "",
      phone: c.phone ?? "",
      notes: (c.notes ?? "").replace(/\n/g, " ").slice(0, 500),
      attachmentCount: c.attachmentCount ?? 0,
    }));
    const csv = toCsv(rows, [
      { key: "id", header: "מזהה" },
      { key: "title", header: "כותרת" },
      { key: "status", header: "סטטוס" },
      { key: "secondaryStatus", header: "סטטוס משני" },
      { key: "slaState", header: "SLA" },
      { key: "priority", header: "עדיפות" },
      { key: "assignee", header: "אחראי" },
      { key: "createdAt", header: "נפתח" },
      { key: "dueAt", header: "יעד" },
      { key: "resolvedAt", header: "נסגר" },
      { key: "handlingMinutes", header: "זמן טיפול (ד׳)" },
      { key: "phone", header: "טלפון" },
      { key: "notes", header: "הערות" },
      { key: "attachmentCount", header: "קבצים" },
    ]);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`complaints-${stamp}.csv`, csv);
    toast.success(`יוצאו ${rows.length} תלונות`);
  };

  const handleSaveView = () => {
    const name = window.prompt("שם התצוגה?");
    if (!name?.trim()) return;
    addView({
      name: name.trim(),
      scope: SCOPE,
      filters: {
        status: filters.status,
        slaState: filters.slaState,
        owner: filters.owner,
        from: filters.from,
        to: filters.to,
      },
    });
    toast.success("התצוגה נשמרה");
  };

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

        <div className="flex items-center gap-2">
          {/* Saved views */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl" />
              }
            >
              <Bookmark className="size-3.5" />
              תצוגות שמורות
              {savedViews.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ms-1 h-5 rounded-full px-1.5 text-[10px]"
                >
                  {savedViews.length}
                </Badge>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>תצוגות שמורות</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {savedViews.length === 0 && (
                <div className="text-muted-foreground px-2 py-3 text-center text-xs">
                  אין תצוגות שמורות עדיין
                </div>
              )}
              {savedViews.map((v) => (
                <DropdownMenuItem
                  key={v.id}
                  onClick={() => setFilters(v.filters as ComplaintsFilters)}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <BookmarkCheck className="text-bfresh-blue size-3.5" />
                    <span className="truncate">{v.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeView(v.id);
                      toast.success("תצוגה נמחקה");
                    }}
                    className="text-muted-foreground hover:text-bfresh-coral"
                    aria-label="מחק תצוגה"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSaveView}
                disabled={activeCount === 0}
                className="text-bfresh-blue gap-1.5 font-bold"
              >
                <Bookmark className="size-3.5" />
                שמור תצוגה נוכחית
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="h-9 gap-1.5 rounded-xl"
            disabled={!data?.complaints?.length}
          >
            <Download className="size-3.5" />
            ייצוא CSV
          </Button>
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
          onRowClick={(c) => setDrillComplaint(c)}
          onOwnerClick={(id) => setDrillOwner(id)}
        />
      )}

      <ComplaintDrillPanel
        complaint={drillComplaint}
        employees={data?.employees}
        onOpenChange={(o) => !o && setDrillComplaint(null)}
      />
      <OwnerDrillPanel
        ownerId={drillOwner}
        complaints={data?.complaints}
        employees={data?.employees}
        onOpenChange={(o) => !o && setDrillOwner(null)}
        onSelectComplaint={(c) => {
          setDrillOwner(null);
          setDrillComplaint(c);
        }}
      />
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
