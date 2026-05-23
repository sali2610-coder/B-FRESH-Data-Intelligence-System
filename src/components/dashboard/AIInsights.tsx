"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Info,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AIInsight } from "@/types/domain";

const KIND_META = {
  positive: {
    icon: TrendingUp,
    badge: "חיובי",
    badgeClass: "bg-emerald-500/12 text-emerald-700 border-emerald-500/30",
    bar: "from-emerald-500 to-bfresh-fresh-green",
    iconBg: "bg-gradient-to-br from-emerald-500 to-bfresh-fresh-green text-white",
    glow: "shadow-emerald-500/10",
    border: "hover:border-emerald-500/30",
    action: "צפה בפרטים",
  },
  warning: {
    icon: AlertTriangle,
    badge: "התרעה",
    badgeClass: "bg-amber-500/12 text-amber-700 border-amber-500/30",
    bar: "from-amber-500 to-orange-500",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500 text-white",
    glow: "shadow-amber-500/10",
    border: "hover:border-amber-500/30",
    action: "בדוק והגב",
  },
  info: {
    icon: Info,
    badge: "תובנה",
    badgeClass: "bg-bfresh-blue/12 text-bfresh-blue border-bfresh-blue/30",
    bar: "from-bfresh-blue to-bfresh-light-blue",
    iconBg: "bg-gradient-to-br from-bfresh-blue to-bfresh-light-blue text-white",
    glow: "shadow-bfresh-blue/10",
    border: "hover:border-bfresh-blue/30",
    action: "חקור עוד",
  },
} as const;

export function AIInsights({ insights }: { insights: AIInsight[] }) {
  return (
    <Card className="elev-1 flex h-full flex-col overflow-hidden border-border/60">
      <CardHeader className="flex-row items-center justify-between border-b border-border/50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="from-bfresh-blue to-bfresh-fresh-green shadow-bfresh-blue/25 grid size-10 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md">
            <Sparkles className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold tracking-tight">
              תובנות AI · מנהל אנליטי
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              מסקנות אוטומטיות מבוססות נתוני הרשת
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="border-bfresh-blue/30 bg-bfresh-blue/8 text-bfresh-blue rounded-full text-[10px] font-bold tracking-wider"
        >
          BETA
        </Badge>
      </CardHeader>
      <CardContent className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
        {insights.map((ins, i) => {
          const meta = KIND_META[ins.kind];
          const Icon = meta.icon;
          return (
            <motion.div
              key={ins.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className={cn(
                "group bg-card relative flex flex-col gap-2.5 overflow-hidden rounded-2xl border border-transparent p-4 transition-all",
                "hover:elev-2",
                meta.border,
                meta.glow,
              )}
            >
              <span
                className={cn(
                  "pointer-events-none absolute inset-y-0 end-0 w-1 bg-gradient-to-b",
                  meta.bar,
                )}
              />

              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl shadow-md",
                    meta.iconBg,
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full text-[10px] uppercase tracking-wider",
                        meta.badgeClass,
                      )}
                    >
                      {meta.badge}
                    </Badge>
                    {ins.metric && (
                      <span className="text-muted-foreground text-[11px] font-semibold tabular-nums">
                        {ins.metric}
                      </span>
                    )}
                  </div>
                  <div className="text-foreground text-sm font-bold leading-snug">
                    {ins.title}
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground pe-1 text-xs leading-relaxed">
                {ins.detail}
              </p>

              <div className="mt-auto flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/70 hover:text-foreground hover:bg-accent/40 h-7 gap-1 rounded-lg px-2 text-[11px] font-semibold"
                >
                  {meta.action}
                  <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
