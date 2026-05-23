"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SPRING_SMOOTH, enterUp } from "@/lib/motion";

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
      variants={enterUp(index)}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3 }}
      transition={SPRING_SMOOTH}
      className={cn("premium-card group relative overflow-hidden", className)}
    >
      <CardHeader className="flex-row items-start justify-between gap-2 pb-2">
        <div className="min-w-0 space-y-0.5">
          <CardTitle className="text-foreground text-base font-bold tracking-tight">
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-muted-foreground truncate text-xs">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {action}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 h-7 w-7 rounded-lg"
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
        {loading ? <div className="shimmer h-[240px] w-full" /> : children}
      </CardContent>
    </motion.div>
  );
}
