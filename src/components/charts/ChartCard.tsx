"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  loading,
  className,
  index = 0,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  loading?: boolean;
  className?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      <Card className="gap-3 overflow-hidden">
        <CardHeader className="flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold tracking-tight">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-muted-foreground text-xs">{subtitle}</p>
            )}
          </div>
          {action}
        </CardHeader>
        <CardContent className={cn("min-h-[260px]", loading && "grid place-items-center")}>
          {loading ? <Skeleton className="h-[240px] w-full" /> : children}
        </CardContent>
      </Card>
    </motion.div>
  );
}
