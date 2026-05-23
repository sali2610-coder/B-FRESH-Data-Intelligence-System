"use client";

import { motion } from "framer-motion";
import { Activity, Sparkles, Zap, Radio } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { fmtDate } from "@/lib/format";
import { SPRING_SMOOTH } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function HeroSummary({
  environment = "Production · ענן",
  openTasks,
  slaCompliancePct,
  loading,
}: {
  environment?: string;
  openTasks: number;
  slaCompliancePct: number;
  loading?: boolean;
}) {
  const today = new Date();

  return (
    <motion.section
      initial={{ opacity: 0, y: -16, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={SPRING_SMOOTH}
      className="relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-bl from-bfresh-blue via-[color:oklch(0.58_0.17_220)] to-bfresh-fresh-green p-5 text-white shadow-[0_18px_60px_-14px_oklch(0.55_0.18_235/0.45)] md:rounded-[28px] md:p-8 lg:p-10"
    >
      {/* Layered glow blobs */}
      <motion.span
        aria-hidden
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.55, 0.8, 0.55] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-24 -right-20 size-80 rounded-full bg-white/30 blur-3xl"
      />
      <motion.span
        aria-hidden
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none absolute -bottom-24 -left-16 size-80 rounded-full bg-bfresh-fresh-green/50 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"
      />

      {/* Grid pattern */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[11px] font-bold backdrop-blur-md">
            <Radio className="size-3" />
            {environment}
            <span className="mx-1 size-1 rounded-full bg-white/50" />
            {fmtDate(today, "EEEE · d בMMMM yyyy")}
          </div>

          <div>
            <h1 className="text-2xl font-black leading-[1.1] tracking-tight md:text-4xl lg:text-[2.7rem]">
              מרכז הבקרה של{" "}
              <span className="bg-gradient-to-l from-white to-white/70 bg-clip-text text-transparent">
                B-FRESH
              </span>
            </h1>
            <p className="mt-2 max-w-xl text-[13px] text-white/85 md:text-[15px]">
              תמונת מצב חיה של ביצועי הרשת, סניפים, עובדים ועמידה ביעדי שירות —
              מתעדכן בזמן אמת.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/85">
            <Sparkles className="size-3" />
            תובנות AI פעילות · ניתוח מתבצע ברקע
          </div>
        </div>

        <div className="flex flex-wrap gap-3 md:flex-nowrap">
          <HeroPill
            icon={Activity}
            label="משימות פתוחות"
            value={loading ? null : openTasks}
            suffix=""
          />
          <HeroPill
            icon={Zap}
            label="עמידה ב-SLA"
            value={loading ? null : slaCompliancePct}
            suffix="%"
            decimals={1}
          />
        </div>
      </div>
    </motion.section>
  );
}

function HeroPill({
  icon: Icon,
  label,
  value,
  suffix,
  decimals = 0,
}: {
  icon: typeof Activity;
  label: string;
  value: number | null;
  suffix: string;
  decimals?: number;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={SPRING_SMOOTH}
      className={cn(
        "sheen relative flex min-w-[180px] items-center gap-3 rounded-2xl border border-white/25 bg-white/15 px-4 py-3.5 backdrop-blur-xl",
        "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.25),0_8px_24px_-6px_oklch(0_0_0/0.2)]",
      )}
    >
      <div className="grid size-10 place-items-center rounded-xl bg-white/25 ring-1 ring-white/30">
        <Icon className="size-4" />
      </div>
      <div className="leading-tight">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-white/80">
          {label}
        </div>
        <div className="text-[22px] font-black tabular-nums">
          {value === null ? (
            <span className="text-white/55">—</span>
          ) : (
            <>
              <NumberFlow
                value={value}
                format={{ maximumFractionDigits: decimals }}
                locales="he-IL"
                spinTiming={{ duration: 800, easing: "cubic-bezier(0.22,1,0.36,1)" }}
              />
              {suffix}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
