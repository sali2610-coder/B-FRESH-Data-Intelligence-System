"use client";

import { useSyncExternalStore } from "react";
import { fmtDate, fmtTime } from "@/lib/format";

function subscribe(cb: () => void) {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
}

function getSnapshot() {
  return Math.floor(Date.now() / 1000);
}

function getServerSnapshot() {
  return 0;
}

export function LiveClock() {
  const tick = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (tick === 0) {
    return (
      <div className="text-muted-foreground hidden text-xs md:block">
        --:--:--
      </div>
    );
  }

  const now = new Date(tick * 1000);
  return (
    <div className="hidden flex-col items-end leading-tight md:flex">
      <span className="text-foreground font-mono text-sm font-semibold tabular-nums">
        {fmtTime(now)}
      </span>
      <span className="text-muted-foreground text-[11px]">{fmtDate(now)}</span>
    </div>
  );
}
