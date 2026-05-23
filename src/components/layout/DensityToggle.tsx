"use client";

import { LayoutGrid, Rows3 } from "lucide-react";
import { motion } from "framer-motion";
import { useUI } from "@/lib/stores/ui";
import { SPRING_BOUNCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function DensityToggle() {
  const { density, setDensity } = useUI();

  return (
    <div className="bg-muted/50 relative flex h-9 items-center rounded-xl p-0.5 text-[11px] font-bold">
      <button
        type="button"
        onClick={() => setDensity("comfortable")}
        aria-pressed={density === "comfortable"}
        className={cn(
          "relative z-10 inline-flex h-8 items-center gap-1 rounded-lg px-2.5 transition-colors",
          density === "comfortable"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <LayoutGrid className="size-3.5" />
        <span className="hidden md:inline">נוח</span>
      </button>
      <button
        type="button"
        onClick={() => setDensity("compact")}
        aria-pressed={density === "compact"}
        className={cn(
          "relative z-10 inline-flex h-8 items-center gap-1 rounded-lg px-2.5 transition-colors",
          density === "compact"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Rows3 className="size-3.5" />
        <span className="hidden md:inline">צפוף</span>
      </button>
      <motion.span
        layout
        transition={SPRING_BOUNCE}
        className={cn(
          "absolute inset-y-0.5 w-[calc(50%-2px)] rounded-lg bg-white shadow-sm",
          density === "comfortable" ? "end-0.5" : "start-0.5",
        )}
      />
    </div>
  );
}
