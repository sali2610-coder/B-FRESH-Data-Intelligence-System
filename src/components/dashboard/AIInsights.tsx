"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AIInsight } from "@/types/domain";

const KIND_META = {
  positive: {
    icon: TrendingUp,
    badge: "חיובי",
    badgeClass: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    bar: "from-emerald-500 to-bfresh-fresh-green",
    iconBg: "bg-emerald-500/15 text-emerald-700",
  },
  warning: {
    icon: AlertTriangle,
    badge: "התרעה",
    badgeClass: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    bar: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-500/15 text-amber-700",
  },
  info: {
    icon: Info,
    badge: "תובנה",
    badgeClass: "bg-bfresh-blue/15 text-bfresh-blue border-bfresh-blue/30",
    bar: "from-bfresh-blue to-bfresh-light-blue",
    iconBg: "bg-bfresh-blue/15 text-bfresh-blue",
  },
} as const;

export function AIInsights({ insights }: { insights: AIInsight[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="from-bfresh-blue to-bfresh-fresh-green grid size-9 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm">
            <Sparkles className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold tracking-tight">
              תובנות AI
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              מסקנות אוטומטיות מבוססות נתוני הרשת
            </p>
          </div>
        </div>
        <Badge variant="outline" className="rounded-full text-[10px]">
          BETA
        </Badge>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {insights.map((ins, i) => {
          const meta = KIND_META[ins.kind];
          const Icon = meta.icon;
          return (
            <motion.div
              key={ins.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="bg-muted/40 relative overflow-hidden rounded-xl p-4"
            >
              <span
                className={cn(
                  "absolute inset-y-0 end-0 w-1 bg-gradient-to-b",
                  meta.bar,
                )}
              />
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-lg",
                    meta.iconBg,
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("rounded-full text-[10px]", meta.badgeClass)}
                    >
                      {meta.badge}
                    </Badge>
                    {ins.metric && (
                      <span className="text-muted-foreground text-[11px] font-medium">
                        {ins.metric}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold leading-snug">
                    {ins.title}
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {ins.detail}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
