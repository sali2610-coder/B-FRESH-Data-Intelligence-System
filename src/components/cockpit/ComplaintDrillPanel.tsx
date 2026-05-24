"use client";

import {
  AlertOctagon,
  CheckCircle2,
  ExternalLink,
  FileText,
  Paperclip,
  Phone,
  Tag,
  User,
  Clock,
  CalendarClock,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fmtDate, fmtDuration, fmtRelative } from "@/lib/format";
import { safeNumber, safeText } from "@/lib/safe";
import { cn } from "@/lib/utils";
import type { ComplaintEntity, EmployeeEntity } from "@/domain";

const STATUS_LABEL: Record<string, string> = {
  open: "פתוח",
  in_progress: "בטיפול",
  blocked: "חסום",
  done: "הושלם",
};
const SLA_LABEL: Record<string, string> = {
  ok: "תקין",
  at_risk: "בסיכון",
  breached: "חריגה",
};

export function ComplaintDrillPanel({
  complaint,
  employees,
  onOpenChange,
}: {
  complaint: ComplaintEntity | null;
  employees: Pick<EmployeeEntity, "id" | "name" | "avatarColor">[] | null | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const open = !!complaint;
  const emp = complaint?.assigneeId
    ? (employees ?? []).find((e) => e.id === complaint.assigneeId)
    : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-background w-[440px] max-w-full p-0 sm:max-w-md"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>פירוט תלונה</SheetTitle>
          <SheetDescription>פרטי תלונת לקוח מלאים</SheetDescription>
        </SheetHeader>
        {complaint && (
          <ScrollArea className="h-full">
            <div className="space-y-4 p-5">
              {/* Header */}
              <div className="space-y-2">
                <div className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-bold">
                  <Tag className="size-3" />
                  תלונה #{complaint.id}
                </div>
                <h2 className="text-lg font-black tracking-tight leading-snug">
                  {safeText(complaint.title)}
                </h2>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full text-[11px] font-bold",
                      complaint.status === "done"
                        ? "bg-bfresh-fresh-green/10 text-tone-success border-bfresh-fresh-green/25"
                        : complaint.status === "blocked"
                          ? "bg-bfresh-coral/10 text-bfresh-coral border-bfresh-coral/25"
                          : complaint.status === "in_progress"
                            ? "bg-tone-warm/10 text-tone-warm border-tone-warm/25"
                            : "bg-bfresh-blue/10 text-bfresh-blue border-bfresh-blue/25",
                    )}
                  >
                    {STATUS_LABEL[complaint.status] ?? complaint.status}
                  </Badge>
                  {complaint.secondaryStatus && (
                    <Badge
                      variant="outline"
                      className="bg-muted/40 rounded-full text-[10.5px]"
                    >
                      {complaint.secondaryStatus}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full gap-1 text-[11px] font-bold",
                      complaint.slaState === "breached"
                        ? "bg-bfresh-coral/10 text-bfresh-coral border-bfresh-coral/25"
                        : complaint.slaState === "at_risk"
                          ? "bg-tone-warm/10 text-tone-warm border-tone-warm/25"
                          : "bg-bfresh-fresh-green/10 text-tone-success border-bfresh-fresh-green/25",
                    )}
                  >
                    {complaint.slaState === "breached" && (
                      <AlertOctagon className="size-3" />
                    )}
                    SLA · {SLA_LABEL[complaint.slaState]}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Owner + Phone */}
              <div className="space-y-3">
                <DrillRow icon={User} label="אחראי">
                  {emp ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="grid size-7 place-items-center rounded-full text-[10px] font-black text-white ring-2 ring-white shadow-sm"
                        style={{
                          backgroundColor: emp.avatarColor ?? "#12a9e8",
                        }}
                      >
                        {emp.name.slice(0, 1)}
                      </span>
                      <span className="text-sm font-bold">{emp.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </DrillRow>

                {complaint.phone && (
                  <DrillRow icon={Phone} label="טלפון">
                    <a
                      href={`tel:${complaint.phone}`}
                      dir="ltr"
                      className="text-bfresh-blue text-sm font-bold tabular-nums hover:underline"
                    >
                      {complaint.phone}
                    </a>
                  </DrillRow>
                )}
              </div>

              <Separator />

              {/* Timeline */}
              <div className="space-y-3">
                <DrillRow icon={CalendarClock} label="נפתח">
                  <div className="text-sm">
                    <div className="font-bold">{fmtDate(complaint.createdAt)}</div>
                    <div className="text-muted-foreground text-xs">
                      {fmtRelative(complaint.createdAt)}
                    </div>
                  </div>
                </DrillRow>
                {complaint.dueAt && (
                  <DrillRow icon={Clock} label="יעד">
                    <div className="text-sm">
                      <div className="font-bold">{fmtDate(complaint.dueAt)}</div>
                      <div className="text-muted-foreground text-xs">
                        {fmtRelative(complaint.dueAt)}
                      </div>
                    </div>
                  </DrillRow>
                )}
                {complaint.resolvedAt && (
                  <DrillRow icon={CheckCircle2} label="נסגר">
                    <div className="text-sm">
                      <div className="font-bold">
                        {fmtDate(complaint.resolvedAt)}
                      </div>
                      {complaint.handlingMinutes != null && (
                        <div className="text-muted-foreground text-xs">
                          זמן טיפול: {fmtDuration(complaint.handlingMinutes)}
                        </div>
                      )}
                    </div>
                  </DrillRow>
                )}
              </div>

              {(complaint.category || complaint.subCategory || complaint.source) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    {complaint.category && (
                      <DrillRow icon={Tag} label="קטגוריה">
                        <span className="text-sm font-bold">{complaint.category}</span>
                      </DrillRow>
                    )}
                    {complaint.subCategory && (
                      <DrillRow icon={Tag} label="תת-קטגוריה">
                        <span className="text-sm">{complaint.subCategory}</span>
                      </DrillRow>
                    )}
                    {complaint.source && (
                      <DrillRow icon={ExternalLink} label="מקור">
                        <span className="text-sm">{complaint.source}</span>
                      </DrillRow>
                    )}
                  </div>
                </>
              )}

              {complaint.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider">
                      <FileText className="size-3" />
                      הערות
                    </div>
                    <div className="bg-muted/40 rounded-xl p-3 text-[13px] leading-relaxed whitespace-pre-wrap">
                      {complaint.notes}
                    </div>
                  </div>
                </>
              )}

              {safeNumber(complaint.attachmentCount) > 0 && (
                <>
                  <Separator />
                  <DrillRow icon={Paperclip} label="קבצים מצורפים">
                    <span className="text-bfresh-blue text-sm font-black tabular-nums">
                      {safeNumber(complaint.attachmentCount)}
                    </span>
                  </DrillRow>
                </>
              )}

              {/* Provenance */}
              <Separator />
              <div className="text-muted-foreground space-y-1 text-[10.5px]">
                <div className="font-black uppercase tracking-wider">מקור</div>
                {complaint.provenance.source === "monday" && (
                  <div>
                    Monday board {complaint.provenance.boardName} · item{" "}
                    {complaint.provenance.itemId}
                  </div>
                )}
                {complaint.provenance.source === "mock" && (
                  <div>Mock dataset · seed {complaint.provenance.seed}</div>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full gap-1.5"
                disabled
                title="חיבור Monday יבוא בפאזה הבאה"
              >
                <ExternalLink className="size-3.5" />
                פתח ב-Monday
              </Button>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DrillRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="bg-muted/40 text-muted-foreground grid size-8 shrink-0 place-items-center rounded-lg">
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider">
          {label}
        </div>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}
