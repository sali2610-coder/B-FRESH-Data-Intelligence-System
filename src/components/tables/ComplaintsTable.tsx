"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertOctagon,
  ChevronLeft,
  FileText,
  Paperclip,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtDate, fmtRelative } from "@/lib/format";
import { useUI } from "@/lib/stores/ui";
import { cn } from "@/lib/utils";
import { safeNumber, safeText } from "@/lib/safe";
import type { ComplaintEntity, EmployeeEntity, SLAState, TicketStatus } from "@/domain";

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: "פתוח",
  in_progress: "בטיפול",
  blocked: "חסום",
  done: "הושלם",
};
const STATUS_CLASS: Record<TicketStatus, string> = {
  open: "bg-bfresh-blue/10 text-bfresh-blue border-bfresh-blue/25",
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

type SortKey = "createdAt" | "dueAt" | "status";

export function ComplaintsTable({
  complaints,
  employees,
  onRowClick,
  onOwnerClick,
}: {
  complaints: ComplaintEntity[] | null | undefined;
  employees: Pick<EmployeeEntity, "id" | "name" | "avatarColor">[] | null | undefined;
  onRowClick?: (complaint: ComplaintEntity) => void;
  onOwnerClick?: (ownerId: string) => void;
}) {
  const density = useUI((s) => s.density);
  const compact = density === "compact";
  const rowPad = compact ? "py-2" : "py-3";

  const empMap = useMemo(
    () =>
      new Map(
        (Array.isArray(employees) ? employees : []).map((e) => [e.id, e]),
      ),
    [employees],
  );

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDesc, setSortDesc] = useState(true);

  const list = useMemo(() => {
    const safe = Array.isArray(complaints) ? complaints.filter(Boolean) : [];
    const sorted = [...safe].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (av < bv) return sortDesc ? 1 : -1;
      if (av > bv) return sortDesc ? -1 : 1;
      return 0;
    });
    return sorted;
  }, [complaints, sortKey, sortDesc]);

  if (list.length === 0) {
    return (
      <div className="text-muted-foreground rounded-2xl border border-dashed border-border/60 p-12 text-center text-sm">
        אין תלונות תואמות לסינון הנוכחי
      </div>
    );
  }

  return (
    <div className="border-border/60 relative max-h-[640px] overflow-auto rounded-2xl border">
      <table className="w-full min-w-[960px] text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-border/50 bg-gradient-to-b from-muted/70 via-muted/55 to-muted/30 backdrop-blur-md">
            <Th rowPad={rowPad} onClick={() => toggle("createdAt", setSortKey, sortKey, setSortDesc, sortDesc)} active={sortKey === "createdAt"} desc={sortDesc}>
              נפתח
            </Th>
            <Th rowPad={rowPad}>תלונה</Th>
            <Th rowPad={rowPad}>אחראי</Th>
            <Th rowPad={rowPad} onClick={() => toggle("status", setSortKey, sortKey, setSortDesc, sortDesc)} active={sortKey === "status"} desc={sortDesc}>
              סטטוס
            </Th>
            <Th rowPad={rowPad}>סטטוס משני</Th>
            <Th rowPad={rowPad}>SLA</Th>
            <Th rowPad={rowPad} onClick={() => toggle("dueAt", setSortKey, sortKey, setSortDesc, sortDesc)} active={sortKey === "dueAt"} desc={sortDesc}>
              יעד
            </Th>
            <Th rowPad={rowPad}>פרטים</Th>
            <Th rowPad={rowPad}></Th>
          </tr>
        </thead>
        <tbody>
          {list.map((c, i) => {
            const emp = c.assigneeId ? empMap.get(c.assigneeId) : undefined;
            const edge =
              c.slaState === "breached"
                ? "before:bg-bfresh-coral"
                : c.slaState === "at_risk"
                  ? "before:bg-tone-warm"
                  : c.status === "done"
                    ? "before:bg-bfresh-fresh-green"
                    : "before:bg-bfresh-blue/40";
            return (
              <motion.tr
                key={c.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: Math.min(i * 0.015, 0.6),
                }}
                onClick={() => onRowClick?.(c)}
                className={cn(
                  "group relative border-b border-border/30 last:border-0 cursor-pointer transition-colors",
                  "before:absolute before:inset-y-1.5 before:start-0 before:w-[3px] before:rounded-full",
                  edge,
                  i % 2 === 0 ? "bg-transparent" : "bg-muted/[0.18]",
                  "hover:bg-bfresh-blue/[0.05]",
                )}
              >
                <td className={cn("ps-4 text-xs text-muted-foreground", rowPad)}>
                  <div className="leading-tight">
                    <div>{fmtRelative(c.createdAt)}</div>
                    <div className="text-[10px]">{fmtDate(c.createdAt, "d/M HH:mm")}</div>
                  </div>
                </td>
                <td className={cn("ps-4", rowPad)}>
                  <div className="flex flex-col leading-tight max-w-md">
                    <span className="font-semibold truncate">{safeText(c.title)}</span>
                    <span className="text-muted-foreground text-[11px] tabular-nums">
                      #{c.id}
                    </span>
                  </div>
                </td>
                <td className={cn("ps-4", rowPad)}>
                  {emp ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOwnerClick && c.assigneeId)
                          onOwnerClick(c.assigneeId);
                      }}
                      className="hover:bg-bfresh-blue/[0.08] -mx-1 inline-flex items-center gap-2 rounded-lg px-1 py-0.5 transition-colors"
                    >
                      <span
                        className="grid size-7 place-items-center rounded-full text-[10px] font-black text-white ring-2 ring-white shadow-sm"
                        style={{ backgroundColor: emp.avatarColor ?? "#12a9e8" }}
                      >
                        {emp.name.slice(0, 1)}
                      </span>
                      <span className="text-xs font-medium">{emp.name}</span>
                    </button>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
                <td className={cn("ps-4", rowPad)}>
                  <Badge
                    variant="outline"
                    className={cn("rounded-full text-[11px] font-bold", STATUS_CLASS[c.status])}
                  >
                    {STATUS_LABEL[c.status]}
                  </Badge>
                </td>
                <td className={cn("ps-4 text-xs", rowPad)}>
                  {c.secondaryStatus ? (
                    <Badge variant="outline" className="bg-muted/40 rounded-full text-[10.5px]">
                      {c.secondaryStatus}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className={cn("ps-4", rowPad)}>
                  <Badge
                    variant="outline"
                    className={cn("rounded-full text-[11px] font-bold", SLA_CLASS[c.slaState])}
                  >
                    {c.slaState === "breached" && (
                      <AlertOctagon className="me-0.5 size-3" />
                    )}
                    {SLA_LABEL[c.slaState]}
                  </Badge>
                </td>
                <td className={cn("ps-4 text-xs", rowPad)}>
                  {c.dueAt ? (
                    <span className="text-muted-foreground">
                      {fmtDate(c.dueAt, "d/M/yy")}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className={cn("ps-4", rowPad)}>
                  <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
                    {c.phone && (
                      <span className="inline-flex items-center gap-0.5" title={c.phone}>
                        <Phone className="size-3" />
                        <span dir="ltr" className="tabular-nums">
                          {c.phone}
                        </span>
                      </span>
                    )}
                    {c.notes && (
                      <span className="inline-flex items-center gap-0.5" title={c.notes}>
                        <FileText className="size-3" />
                        <span className="truncate max-w-[160px]">
                          {c.notes.slice(0, 40)}
                          {c.notes.length > 40 ? "…" : ""}
                        </span>
                      </span>
                    )}
                    {safeNumber(c.attachmentCount) > 0 && (
                      <span className="text-bfresh-blue inline-flex items-center gap-0.5 font-bold">
                        <Paperclip className="size-3" />
                        {safeNumber(c.attachmentCount)}
                      </span>
                    )}
                  </div>
                </td>
                <td className={cn("pe-4 text-end", rowPad)}>
                  <ChevronLeft className="text-muted-foreground/70 group-hover:text-bfresh-blue inline size-4 transition-all -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  rowPad,
  onClick,
  active,
  desc,
}: {
  children?: React.ReactNode;
  rowPad: string;
  onClick?: () => void;
  active?: boolean;
  desc?: boolean;
}) {
  return (
    <th
      className={cn(
        "ps-4 text-start text-[10.5px] uppercase tracking-wider",
        rowPad,
      )}
    >
      {children &&
        (onClick ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={cn(
              "text-muted-foreground hover:text-foreground -ms-2 h-7 gap-1 font-bold",
              active && "text-foreground",
            )}
          >
            {children}
            {active && <span className="text-[9px]">{desc ? "▼" : "▲"}</span>}
          </Button>
        ) : (
          <span className="text-muted-foreground -ms-1 font-bold">{children}</span>
        ))}
    </th>
  );
}

function toggle(
  key: SortKey,
  setKey: (k: SortKey) => void,
  cur: SortKey,
  setDesc: (d: boolean) => void,
  curDesc: boolean,
) {
  if (cur === key) setDesc(!curDesc);
  else {
    setKey(key);
    setDesc(true);
  }
}
