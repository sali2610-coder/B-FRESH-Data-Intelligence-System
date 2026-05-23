"use client";

import { motion } from "framer-motion";
import { Activity, Sparkles, Zap } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { fmtDate } from "@/lib/format";
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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-bl from-bfresh-blue via-[color:oklch(0.6_0.16_220)] to-bfresh-fresh-green p-6 text-white shadow-xl shadow-bfresh-blue/15 md:p-8"
    >
      {/* glow blobs */}
      <span className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-white/25 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-20 -left-10 size-72 rounded-full bg-bfresh-fresh-green/40 blur-3xl" />

      {/* grid pattern overlay */}
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold backdrop-blur-md">
            <Sparkles className="size-3" />
            {environment}
            <span className="mx-1 size-1 rounded-full bg-white/50" />
            {fmtDate(today, "EEEE · d בMMMM yyyy")}
          </div>

          <h1 className="text-3xl font-black leading-tight tracking-tight md:text-4xl lg:text-[2.6rem]">
            מרכז הבקרה של <span className="text-white/95">B-FRESH</span>
          </h1>

          <p className="max-w-xl text-sm text-white/85 md:text-[15px]">
            תמונת מצב חיה של ביצועי הרשת, סניפים, עובדים ועמידה ביעדי שירות —
            מתעדכן בזמן אמת.
          </p>
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
    <div
      className={cn(
        "relative flex min-w-[170px] items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-md",
        "border border-white/25 shadow-inner shadow-white/10",
      )}
    >
      <div className="grid size-9 place-items-center rounded-xl bg-white/20">
        <Icon className="size-4" />
      </div>
      <div className="leading-tight">
        <div className="text-[11px] font-medium uppercase tracking-wide text-white/75">
          {label}
        </div>
        <div className="text-xl font-black tabular-nums">
          {value === null ? (
            <span className="text-white/60">—</span>
          ) : (
            <>
              <NumberFlow
                value={value}
                format={{ maximumFractionDigits: decimals }}
                locales="he-IL"
              />
              {suffix}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
