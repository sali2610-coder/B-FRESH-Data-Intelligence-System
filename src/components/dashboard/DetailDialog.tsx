"use client";

import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmtDate, fmtDuration } from "@/lib/format";
import type { Branch, Employee, Task } from "@/types/domain";

export function DetailDialog({
  task,
  branches,
  employees,
  onOpenChange,
}: {
  task: Task | null;
  branches: Branch[];
  employees: Employee[];
  onOpenChange: (open: boolean) => void;
}) {
  const open = !!task;
  const branch = task ? branches.find((b) => b.id === task.branchId) : undefined;
  const employee = task
    ? employees.find((e) => e.id === task.assigneeId)
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir="rtl">
        {task && (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                {task.title}
              </DialogTitle>
              <DialogDescription>
                פריט #{task.mondayItemId} · נפתח {fmtDate(task.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="סניף" value={branch?.name ?? "—"} />
              <Field label="אחראי" value={employee?.name ?? "—"} />
              <Field
                label="סטטוס"
                value={<Badge variant="outline">{task.status}</Badge>}
              />
              <Field
                label="SLA"
                value={<Badge variant="outline">{task.slaState}</Badge>}
              />
              <Field
                label="עדיפות"
                value={<Badge variant="outline">{task.priority}</Badge>}
              />
              <Field
                label="זמן טיפול"
                value={
                  task.handlingMinutes ? fmtDuration(task.handlingMinutes) : "—"
                }
              />
              <Field label="יעד" value={fmtDate(task.dueAt, "d בMMM yyyy HH:mm")} />
              <Field
                label="נסגר"
                value={
                  task.resolvedAt
                    ? fmtDate(task.resolvedAt, "d בMMM yyyy HH:mm")
                    : "—"
                }
              />
            </div>

            <div className="mt-2 flex justify-end">
              <Button variant="outline" className="gap-1.5" disabled>
                <ExternalLink className="size-3.5" />
                פתח ב-Monday
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="bg-muted/40 flex flex-col gap-0.5 rounded-lg p-2.5">
      <span className="text-muted-foreground text-[11px] font-medium">
        {label}
      </span>
      <span className="text-foreground text-sm font-semibold">{value}</span>
    </div>
  );
}
