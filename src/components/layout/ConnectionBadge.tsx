"use client";

import { Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { useConnection } from "@/hooks/useConnection";
import { cn } from "@/lib/utils";

export function ConnectionBadge() {
  const { data, isLoading } = useConnection();

  if (isLoading || !data) {
    return (
      <div className="bg-muted/40 hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold md:flex">
        <span className="bg-muted-foreground inline-block size-2 rounded-full" />
        בודק חיבור…
      </div>
    );
  }

  if (data.label === "live") {
    return (
      <div
        title={data.accountName ?? "Monday Live"}
        className="from-bfresh-blue/10 to-bfresh-light-blue/10 text-bfresh-blue ring-bfresh-blue/25 hidden items-center gap-1.5 rounded-full bg-gradient-to-l px-3 py-1.5 text-[11px] font-bold ring-1 md:flex"
      >
        <span className="bg-bfresh-blue relative inline-flex size-2 rounded-full">
          <span className="bg-bfresh-blue absolute inset-0 animate-ping rounded-full opacity-75" />
        </span>
        <Wifi className="size-3" />
        Live Monday Data
      </div>
    );
  }

  if (data.label === "error") {
    return (
      <div
        title={data.error?.message ?? "Connection error"}
        className={cn(
          "bg-bfresh-coral/10 text-bfresh-coral ring-bfresh-coral/25 hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 md:flex",
        )}
      >
        <AlertTriangle className="size-3" />
        Connection Error · משתמש בדמה
      </div>
    );
  }

  return (
    <div className="from-tone-warm/10 to-tone-sla/10 text-tone-warm ring-tone-warm/30 hidden items-center gap-1.5 rounded-full bg-gradient-to-l px-3 py-1.5 text-[11px] font-bold ring-1 md:flex">
      <WifiOff className="size-3" />
      Mock Mode
    </div>
  );
}
