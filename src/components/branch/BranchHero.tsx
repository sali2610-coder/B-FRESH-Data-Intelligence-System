"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Phone,
  Mail,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HealthGauge } from "./HealthGauge";
import { SPRING_SMOOTH } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { BranchProfile } from "@/types/domain";

const REGION_LABEL: Record<string, string> = {
  north: "צפון",
  center: "מרכז",
  south: "דרום",
};

export function BranchHero({ profile }: { profile: BranchProfile }) {
  const { branch, health, manager } = profile;
  const components = [
    { label: "SLA", value: health.components.sla },
    { label: "תלונות", value: health.components.complaints },
    { label: "ביקורת", value: health.components.inspection },
    { label: "אחזקה", value: health.components.maintenance },
    { label: "איוש", value: health.components.staffing },
    { label: "סנטימנט", value: health.components.sentiment },
  ];

  const alerts = [
    health.alerts.recurringIssue && {
      icon: AlertTriangle,
      label: "תקלה חוזרת",
      tone: "bg-rose-500/15 text-rose-700 border-rose-500/30",
    },
    health.alerts.slaRisk && {
      icon: AlertTriangle,
      label: "סיכון SLA",
      tone: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    },
    health.alerts.inspectionOverdue && {
      icon: AlertTriangle,
      label: "ביקורת באיחור",
      tone: "bg-bfresh-blue/12 text-bfresh-blue border-bfresh-blue/30",
    },
    health.alerts.staffingShortage && {
      icon: AlertTriangle,
      label: "חוסר באיוש",
      tone: "bg-violet-500/15 text-violet-700 border-violet-500/30",
    },
  ].filter(Boolean) as { icon: typeof AlertTriangle; label: string; tone: string }[];

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_SMOOTH}
      className="premium-card relative overflow-hidden p-6 md:p-8"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-32 -end-24 size-72 rounded-full bg-bfresh-blue/15 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -start-16 size-72 rounded-full bg-bfresh-fresh-green/15 blur-3xl"
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
        {/* Left: identity */}
        <div className="flex-1 space-y-4">
          <Link
            href="/network/branches"
            className="text-muted-foreground inline-flex items-center gap-1 text-[11px] font-bold hover:text-foreground"
          >
            <ArrowRight className="size-3" />
            רשת · סניפים
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <div className="from-bfresh-blue to-bfresh-fresh-green grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md shadow-bfresh-blue/25 ring-1 ring-white/30">
              <Building2 className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                {branch.name}
              </h1>
              <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
                <span className="font-semibold">
                  אזור {REGION_LABEL[branch.region]}
                </span>
                <span>·</span>
                <span>מזהה {branch.id}</span>
              </div>
            </div>
          </div>

          {/* Manager card */}
          <div className="bg-muted/40 ring-border/40 inline-flex items-center gap-3 rounded-2xl p-3 ring-1">
            <span
              className="grid size-9 place-items-center rounded-full text-sm font-black text-white shadow-sm ring-2 ring-white"
              style={{ backgroundColor: "#1e90ff" }}
            >
              {manager.name.slice(0, 1)}
            </span>
            <div className="leading-tight">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                מנהל סניף
              </div>
              <div className="text-sm font-bold">{manager.name}</div>
            </div>
            <div className="border-border/40 me-1 ms-2 flex items-center gap-1 border-s ps-3 text-[11px]">
              {manager.phone && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-bfresh-blue/10 hover:text-bfresh-blue h-7 w-7 rounded-lg"
                  aria-label="התקשר"
                >
                  <Phone className="size-3.5" />
                </Button>
              )}
              {manager.email && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-bfresh-blue/10 hover:text-bfresh-blue h-7 w-7 rounded-lg"
                  aria-label="דוא״ל"
                >
                  <Mail className="size-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground inline-flex items-center gap-1 text-[10.5px] font-black uppercase tracking-wider">
                <Sparkles className="size-3" />
                התרעות
              </span>
              {alerts.map((a) => {
                const Icon = a.icon;
                return (
                  <Badge
                    key={a.label}
                    variant="outline"
                    className={cn("rounded-full gap-1 text-[10.5px]", a.tone)}
                  >
                    <Icon className="size-3" />
                    {a.label}
                  </Badge>
                );
              })}
            </div>
          )}
          {alerts.length === 0 && (
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 gap-1 rounded-full"
            >
              <ShieldCheck className="size-3" />
              ללא התרעות
            </Badge>
          )}
        </div>

        {/* Right: gauge */}
        <div className="flex flex-col items-center gap-4">
          <HealthGauge score={health.score} status={health.status} size={180} />
          <div className="grid w-full max-w-xs grid-cols-3 gap-1.5">
            {components.map((c) => (
              <div
                key={c.label}
                className="bg-muted/40 rounded-lg p-2 text-center"
              >
                <div className="text-muted-foreground text-[9.5px] font-bold uppercase tracking-wider">
                  {c.label}
                </div>
                <div className="text-foreground text-sm font-black tabular-nums">
                  {c.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
