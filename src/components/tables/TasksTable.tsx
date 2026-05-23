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
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmtDuration, fmtRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Branch, Employee, Task, TaskStatus, SLAState } from "@/types/domain";

const STATUS_LABEL: Record<TaskStatus, string> = {
  open: "פתוח",
  in_progress: "בטיפול",
  blocked: "חסום",
  done: "הושלם",
};

const STATUS_CLASS: Record<TaskStatus, string> = {
  open: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  in_progress: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  blocked: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  done: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
};

const SLA_LABEL: Record<SLAState, string> = {
  ok: "תקין",
  at_risk: "בסיכון",
  breached: "חריגה",
};

const SLA_CLASS: Record<SLAState, string> = {
  ok: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  at_risk: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  breached: "bg-rose-500/10 text-rose-700 border-rose-500/20",
};

export function TasksTable({
  tasks,
  branches,
  employees,
  onRowClick,
}: {
  tasks: Task[];
  branches: Branch[];
  employees: Employee[];
  onRowClick?: (task: Task) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const branchMap = useMemo(
    () => Object.fromEntries(branches.map((b) => [b.id, b])),
    [branches],
  );
  const empMap = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.id, e])),
    [employees],
  );

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: "title",
        header: "משימה",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.title}</span>
            <span className="text-muted-foreground text-[11px]">
              #{row.original.mondayItemId}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "branchId",
        header: "סניף",
        cell: ({ row }) => branchMap[row.original.branchId]?.name ?? "—",
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
                className="grid size-6 place-items-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: e.avatarColor }}
              >
                {e.name.slice(0, 1)}
              </span>
              <span className="text-xs">{e.name}</span>
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
            className={cn("rounded-full", STATUS_CLASS[row.original.status])}
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
            className={cn("rounded-full", SLA_CLASS[row.original.slaState])}
          >
            {SLA_LABEL[row.original.slaState]}
          </Badge>
        ),
      },
      {
        accessorKey: "handlingMinutes",
        header: "זמן טיפול",
        cell: ({ row }) =>
          row.original.handlingMinutes
            ? fmtDuration(row.original.handlingMinutes)
            : "—",
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
    data: tasks,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="bg-muted/40">
              {hg.headers.map((h) => (
                <TableHead key={h.id} className="text-start">
                  {h.isPlaceholder ? null : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={h.column.getToggleSortingHandler()}
                      className="h-8 -ms-2 gap-1 text-xs font-semibold"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      <ArrowUpDown className="size-3 opacity-50" />
                    </Button>
                  )}
                </TableHead>
              ))}
              <TableHead />
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
              className="hover:bg-accent/30 cursor-pointer"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-2.5">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
              <TableCell className="py-2.5">
                <ExternalLink className="text-muted-foreground size-3.5" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
