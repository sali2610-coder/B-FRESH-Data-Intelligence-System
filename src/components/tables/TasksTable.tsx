"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtDuration, fmtRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useUI } from "@/lib/stores/ui";
import type { Branch, Employee, Task, TaskStatus, SLAState } from "@/types/domain";

const STATUS_LABEL: Record<TaskStatus, string> = {
  open: "פתוח",
  in_progress: "בטיפול",
  blocked: "חסום",
  done: "הושלם",
};

const STATUS_CLASS: Record<TaskStatus, string> = {
  open: "bg-blue-500/10 text-blue-700 border-blue-500/25",
  in_progress: "bg-tone-warm/10 text-tone-warm border-tone-warm/25",
  blocked: "bg-bfresh-coral/10 text-bfresh-coral border-bfresh-coral/25",
  done: "bg-bfresh-fresh-green/10 text-tone-success border-bfresh-fresh-green/25",
};

const SLA_LABEL: Record<SLAState, string> = {
  ok: "תקין",
  at_risk: "בסיכון",
  breached: "חריגה",
};

const SLA_CLASS: Record<SLAState, string> = {
  ok: "bg-bfresh-fresh-green/10 text-tone-success border-bfresh-fresh-green/25",
  at_risk: "bg-tone-warm/10 text-tone-warm border-tone-warm/25",
  breached: "bg-bfresh-coral/10 text-bfresh-coral border-bfresh-coral/25",
};

export function TasksTable({
  tasks,
  branches,
  employees,
  onRowClick,
}: {
  tasks: Task[] | null | undefined;
  branches: Branch[] | null | undefined;
  employees: Employee[] | null | undefined;
  onRowClick?: (task: Task) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const density = useUI((s) => s.density);
  const compact = density === "compact";
  const rowPad = compact ? "py-2" : "py-3";
  const taskList = Array.isArray(tasks) ? tasks.filter(Boolean) : [];
  const branchList = Array.isArray(branches) ? branches.filter(Boolean) : [];
  const employeeList = Array.isArray(employees)
    ? employees.filter(Boolean)
    : [];

  const branchMap = useMemo(
    () => Object.fromEntries(branchList.map((b) => [b.id, b])),
    [branchList],
  );
  const empMap = useMemo(
    () => Object.fromEntries(employeeList.map((e) => [e.id, e])),
    [employeeList],
  );

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: "title",
        header: "משימה",
        cell: ({ row }) => (
          <div className="flex flex-col leading-tight">
            <span className="font-semibold truncate">{row.original.title}</span>
            <span className="text-muted-foreground text-[11px] tabular-nums">
              #{row.original.mondayItemId}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "branchId",
        header: "סניף",
        cell: ({ row }) => (
          <span className="text-xs font-medium">
            {branchMap[row.original.branchId]?.name ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "assigneeId",
        header: "אחראי",
        cell: ({ row }) => {
          const e = empMap[row.original.assigneeId];
          if (!e) return "—";
          return (
            <div className="flex items-center gap-2">
              <span
                className="grid size-7 place-items-center rounded-full text-[10px] font-black text-white ring-2 ring-white shadow-sm"
                style={{ backgroundColor: e.avatarColor }}
              >
                {e.name.slice(0, 1)}
              </span>
              <span className="text-xs font-medium">{e.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "סטטוס",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "rounded-full font-bold text-[11px]",
              STATUS_CLASS[row.original.status],
            )}
          >
            {STATUS_LABEL[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "slaState",
        header: "SLA",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "rounded-full font-bold text-[11px]",
              SLA_CLASS[row.original.slaState],
            )}
          >
            {SLA_LABEL[row.original.slaState]}
          </Badge>
        ),
      },
      {
        accessorKey: "handlingMinutes",
        header: "זמן טיפול",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs tabular-nums">
            {row.original.handlingMinutes
              ? fmtDuration(row.original.handlingMinutes)
              : "—"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "נפתח",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs">
            {fmtRelative(row.original.createdAt)}
          </span>
        ),
      },
    ],
    [branchMap, empMap],
  );

  const table = useReactTable({
    data: taskList,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="border-border/60 relative max-h-[560px] overflow-auto rounded-2xl border">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="sticky top-0 z-10">
          {table.getHeaderGroups().map((hg) => (
            <tr
              key={hg.id}
              className="border-b border-border/50 bg-gradient-to-b from-muted/70 via-muted/55 to-muted/30 backdrop-blur-md"
            >
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className={cn(
                    "ps-4 text-start text-[10.5px] uppercase tracking-wider",
                    rowPad,
                  )}
                >
                  {h.isPlaceholder ? null : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={h.column.getToggleSortingHandler()}
                      className="text-muted-foreground hover:text-foreground -ms-2 h-7 gap-1 font-bold"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      <ArrowUpDown className="size-3 opacity-50" />
                    </Button>
                  )}
                </th>
              ))}
              <th />
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, i) => {
            const t = row.original;
            const edge =
              t.slaState === "breached"
                ? "before:bg-bfresh-coral"
                : t.slaState === "at_risk"
                  ? "before:bg-tone-warm"
                  : t.status === "done"
                    ? "before:bg-bfresh-fresh-green"
                    : "before:bg-bfresh-blue/40";
            return (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  "group relative border-b border-border/30 last:border-0 cursor-pointer transition-colors",
                  "before:absolute before:inset-y-1.5 before:start-0 before:w-[3px] before:rounded-full",
                  edge,
                  i % 2 === 0 ? "bg-transparent" : "bg-muted/[0.18]",
                  "hover:bg-bfresh-blue/[0.05]",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={cn("ps-4", rowPad)}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                <td className={cn("pe-4 text-end", rowPad)}>
                  <ChevronLeft className="text-muted-foreground/70 group-hover:text-bfresh-blue inline size-4 transition-all -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
