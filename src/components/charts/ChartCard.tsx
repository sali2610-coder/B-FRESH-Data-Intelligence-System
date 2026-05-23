"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  minHeight = 280,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  loading?: boolean;
  className?: string;
  index?: number;
  minHeight?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      <Card className="lift elev-1 group gap-3 overflow-hidden border-border/60">
        <CardHeader className="flex-row items-start justify-between gap-2 pb-2">
          <div className="min-w-0 space-y-0.5">
            <CardTitle className="text-foreground text-base font-bold tracking-tight">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-muted-foreground truncate text-xs">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {action}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-7 w-7"
              aria-label="פעולות נוספות"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent
          className={cn(loading && "grid place-items-center")}
          style={{ minHeight }}
        >
          {loading ? <Skeleton className="h-[240px] w-full" /> : children}
        </CardContent>
      </Card>
    </motion.div>
  );
}
