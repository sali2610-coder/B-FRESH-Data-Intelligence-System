"use client";

import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertOctagon, Clock, MessageSquare, User } from "lucide-react";
import { fmtDuration, fmtRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ComplaintEntity, EmployeeEntity } from "@/domain";

const STATUS_LABEL: Record<string, string> = {
  open: "פתוח",
  in_progress: "בטיפול",
  blocked: "חסום",
  done: "הושלם",
};

export function OwnerDrillPanel({
  ownerId,
  complaints,
  employees,
  onOpenChange,
  onSelectComplaint,
}: {
  ownerId: string | null;
  complaints: ComplaintEntity[] | null | undefined;
  employees: Pick<EmployeeEntity, "id" | "name" | "avatarColor">[] | null | undefined;
  onOpenChange: (open: boolean) => void;
  onSelectComplaint?: (c: ComplaintEntity) => void;
}) {
  const open = !!ownerId;
  const emp = ownerId
    ? (employees ?? []).find((e) => e.id === ownerId)
    : undefined;

  const ownerComplaints = useMemo(() => {
    if (!ownerId) return [];
    return (Array.isArray(complaints) ? complaints : []).filter(
      (c) => c.assigneeId === ownerId,
    );
  }, [complaints, ownerId]);

  const total = ownerComplaints.length;
  const openCount = ownerComplaints.filter((c) => c.status !== "done").length;
  const doneCount = ownerComplaints.filter((c) => c.status === "done").length;
  const overdue = ownerComplaints.filter(
    (c) => c.slaState === "breached",
  ).length;
  const doneOnTime = ownerComplaints.filter(
    (c) => c.status === "done" && c.slaState === "ok",
  ).length;
  const slaScore = doneCount ? Math.round((doneOnTime / doneCount) * 100) : 0;
  const avgMin =
    doneCount > 0
      ? Math.round(
          ownerComplaints
            .filter((c) => c.status === "done")
            .reduce((s, c) => s + (c.handlingMinutes ?? 0), 0) / doneCount,
        )
      : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-background w-[440px] max-w-full p-0 sm:max-w-md"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>פרופיל אחראי</SheetTitle>
          <SheetDescription>סקירה תפעולית של אחראי</SheetDescription>
        </SheetHeader>
        {ownerId && (
          <ScrollArea className="h-full">
            <div className="space-y-4 p-5">
              {/* Identity */}
              <div className="flex items-center gap-3">
                <span
                  className="grid size-12 place-items-center rounded-2xl text-base font-black text-white ring-2 ring-white shadow-md"
                  style={{
                    backgroundColor: emp?.avatarColor ?? "#12a9e8",
                  }}
                >
                  {(emp?.name ?? "?").slice(0, 1)}
                </span>
                <div className="space-y-0.5">
                  <div className="text-muted-foreground inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
                    <User className="size-3" />
                    אחראי
                  </div>
                  <h2 className="text-lg font-black tracking-tight">
                    {emp?.name ?? ownerId.replace(/^e-/, "")}
                  </h2>
                </div>
              </div>

              <Separator />

              {/* KPI grid */}
              <div className="grid grid-cols-2 gap-2">
                <KpiBox label="סה״כ" value={total} />
                <KpiBox label="פתוחות" value={openCount} tone="blue" />
                <KpiBox label="הושלמו" value={doneCount} tone="green" />
                <KpiBox label="חריגות SLA" value={overdue} tone="coral" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <KpiBox
                  label="ציון SLA"
                  value={slaScore}
                  suffix="%"
                  tone={
                    slaScore >= 85 ? "green" : slaScore >= 70 ? "warm" : "coral"
                  }
                />
                <KpiBox
                  label="זמן טיפול ממוצע"
                  value={avgMin ? fmtDuration(avgMin) : "—"}
                  tone="blue"
                />
              </div>

              <Separator />

              <div>
                <div className="text-muted-foreground mb-2 inline-flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider">
                  <MessageSquare className="size-3" />
                  תלונות פעילות · {openCount}
                </div>
                {ownerComplaints.filter((c) => c.status !== "done").length === 0 ? (
                  <div className="text-muted-foreground rounded-xl border border-dashed border-border/60 p-6 text-center text-xs">
                    אין תלונות פתוחות לאחראי זה
                  </div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {ownerComplaints
                      .filter((c) => c.status !== "done")
                      .slice(0, 12)
                      .map((c) => (
                        <li
                          key={c.id}
                          onClick={() => onSelectComplaint?.(c)}
                          className={cn(
                            "group bg-muted/30 hover:bg-bfresh-blue/[0.06] cursor-pointer rounded-xl p-3 transition-colors",
                            "border border-transparent hover:border-border/60",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-sm font-bold truncate">
                                {c.title}
                              </div>
                              <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                                <Badge
                                  variant="outline"
                                  className="rounded-full text-[10px]"
                                >
                                  {STATUS_LABEL[c.status] ?? c.status}
                                </Badge>
                                {c.secondaryStatus && (
                                  <Badge
                                    variant="outline"
                                    className="bg-muted/40 rounded-full text-[10px]"
                                  >
                                    {c.secondaryStatus}
                                  </Badge>
                                )}
                                <Clock className="size-3" />
                                {fmtRelative(c.createdAt)}
                              </div>
                            </div>
                            {c.slaState === "breached" && (
                              <span className="text-bfresh-coral inline-flex shrink-0 items-center gap-0.5 text-[11px] font-black">
                                <AlertOctagon className="size-3" />
                                חריגה
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}

function KpiBox({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  tone?: "blue" | "green" | "coral" | "warm";
}) {
  const tones = {
    blue: "text-bfresh-blue bg-bfresh-blue/8",
    green: "text-tone-success bg-bfresh-fresh-green/8",
    coral: "text-bfresh-coral bg-bfresh-coral/8",
    warm: "text-tone-warm bg-tone-warm/8",
  } as const;
  const t = tone ? tones[tone] : "bg-muted/40";
  return (
    <div className={cn("rounded-xl p-3", t)}>
      <div className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">
        {label}
      </div>
      <div className="mt-1 text-xl font-black leading-none tabular-nums">
        {value}
        {suffix && (
          <span className="text-muted-foreground text-xs font-bold">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
