"use client";

import type { ReactNode } from "react";
import { useUI } from "@/lib/stores/ui";

export function DensityRoot({ children }: { children: ReactNode }) {
  const density = useUI((s) => s.density);
  return (
    <div data-density={density} className="contents">
      {children}
    </div>
  );
}
