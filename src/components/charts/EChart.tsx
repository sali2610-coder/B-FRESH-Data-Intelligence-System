"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export function EChart({
  option,
  height = 260,
}: {
  option: EChartsOption;
  height?: number;
}) {
  const merged = useMemo<EChartsOption>(
    () => ({
      textStyle: { fontFamily: "var(--font-heebo), Heebo, system-ui, sans-serif" },
      ...option,
    }),
    [option],
  );

  return (
    <ReactECharts
      option={merged}
      style={{ height, width: "100%" }}
      opts={{ renderer: "canvas", locale: "en" }}
      notMerge
      lazyUpdate
    />
  );
}
