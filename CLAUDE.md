# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**B-FRESH Data Intelligence System** — internal BI cockpit replacing standard Monday.com dashboards for the B-FRESH chain. Hebrew/RTL, mobile-first, real-time oriented. Audience: executives, regional managers, franchisees, ops, marketing, accounting.

## Commands

```bash
pnpm install         # install deps (uses pnpm-workspace.yaml allowBuilds)
pnpm dev             # next dev (Turbopack) — http://localhost:3000
pnpm build           # production build
pnpm start           # serve production build
pnpm lint            # eslint via eslint.config.mjs
```

No test runner wired yet — when adding tests, prefer Vitest + Testing Library; document the single-test command here.

## Stack

- **Next.js 16 (App Router)** + React 19 + TypeScript, src/ layout, `@/*` import alias.
- **Tailwind CSS 4** (CSS-first, `@theme inline` in `globals.css`) + **shadcn/ui** (base-nova style, RTL enabled, CSS variables).
- **TanStack Query** (server state) + **Zustand** (UI/filter state) — no Redux.
- **TanStack Table** for data grids.
- **ECharts** (primary, via `echarts-for-react`, dynamic-imported to avoid SSR) + **Recharts** (secondary fallback).
- **Framer Motion** for transitions/active-nav indicator.
- **React Hook Form + Zod** for forms (Hebrew error messages).
- **next-themes** for dark-mode-ready theme provider.
- **date-fns** with `he` locale for Hebrew formatting.
- Deploy target: **Vercel**.

## Hard architectural rules

These come from the PRD and must not be relaxed without explicit approval:

1. **No database, no Prisma, no auth.** State sources are Monday.com (mocked today) + external POST endpoints + ephemeral client state.
2. **Monday API token never reaches the client.** All Monday traffic flows through `src/app/api/monday/*` route handlers, which call `src/services/monday`.
3. **Service layer is the abstraction seam.** Pages/hooks never `fetch` Monday directly — they call hooks (`useDashboard`, future `useTasks`, etc.) which hit the route handlers which delegate to the service.
4. **RTL everywhere.** `<html lang="he" dir="rtl">` is set in `src/app/layout.tsx`. Prefer logical Tailwind utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`) over directional ones.
5. **Hebrew copy only** for all user-facing strings. Identifiers/code/comments stay English.
6. **Server components by default**, `"use client"` only when needed (charts, interactive UI, Zustand consumers, motion).
7. **Mock-swappable services.** The `MondayService` interface in `src/services/monday/index.ts` is the contract; the current `MockMondayService` reads `src/mocks/seed.ts` with simulated latency. Real implementation replaces the class, not the interface.

## High-level architecture

```
src/
  app/
    layout.tsx              # RTL html, Heebo+Assistant fonts, Providers + AppShell
    providers.tsx           # QueryClient + ThemeProvider + TooltipProvider + Toaster
    page.tsx                # main dashboard (KPIs + 6 charts + tasks table)
    {employees,branches,sla,insights,forms}/page.tsx   # phase-1 placeholders
    api/monday/dashboard/   # server route — wraps mondayService.getDashboard
  components/
    layout/   AppShell · Sidebar · TopHeader · LiveClock
    dashboard/ KpiCard · DetailDialog · EmptyState · ErrorState · PlaceholderPage
    charts/   ChartCard (shell) · EChart (dynamic wrapper) · charts.ts (option builders)
    tables/   TasksTable (TanStack Table)
    filters/  GlobalFilters (Zustand-backed)
    ui/       shadcn primitives (do not hand-edit unless extending)
  hooks/      useDashboard (TanStack Query against /api/monday/dashboard)
  services/   monday/index.ts (MondayService interface + Mock impl)
  mocks/      seed.ts (deterministic generator → DashboardData)
  types/      domain.ts (Task, Branch, Employee, SLA, DashboardData)
  lib/        utils.ts (cn) · format.ts (he-IL Intl + date-fns/he) · nav.ts · stores/filters.ts
```

**Data flow:** page → `useDashboard()` → `fetch /api/monday/dashboard` → route handler → `mondayService.getDashboard(boardId)` → mock generator or (future) real Monday GraphQL. Same path for every future board/widget — add a hook + a route handler + a service method.

**Filter flow:** `useFilters()` Zustand store holds dateRange/branchId/employeeId/status/slaState. `GlobalFilters` writes; future widgets read and pass into query keys. URL-sync is deferred to phase 4 (PRD §9) — when adding it, keep the store as source of truth and sync both ways from a single hook.

**Theming/brand tokens:** all colors live in `globals.css` as OKLCH CSS variables (`--bfresh-blue`, `--bfresh-fresh-green`, etc.), re-exported through `@theme inline` so Tailwind utilities like `bg-bfresh-blue` and `text-bfresh-fresh-green` work. Dark mode is `.dark` class on `<html>` (next-themes). Add new tokens in both blocks.

**Adding a chart:** add an option builder in `src/components/charts/charts.ts`, wrap with `<ChartCard><EChart option={...} /></ChartCard>`. Never import `echarts-for-react` directly — always through `EChart` (it handles SSR + font + locale).

## Conventions

- Use `cn()` from `@/lib/utils` for class merging.
- Hebrew formatting helpers live in `@/lib/format` — don't reimplement `Intl.NumberFormat("he-IL")` locally.
- Lucide icons only; pass via prop (`icon: LucideIcon`) so KpiCard/PlaceholderPage stay generic.
- New routes go under `src/app/<segment>/page.tsx`. The `AppShell` from root layout wraps everything — pages render their own `<header>` block and content sections.
- pnpm build scripts are gated by `pnpm-workspace.yaml` `allowBuilds` (sharp, unrs-resolver, msw) — extend that list before installing new native-bin deps.

## Deferred phases (PRD §19, not implemented yet)

- **Phase 3** — real Monday GraphQL integration (replace `MockMondayService`, add `MONDAY_API_TOKEN` handling).
- **Phase 4** — URL-sync for global filters (`nuqs` or hand-rolled `searchParams` hook).
- **Phase 5** — Forms engine (`src/services/forms`, `FORMS_SUBMIT_URL`, RHF+Zod field registry).
- **Phase 6** — AI Insights (rule-based first, LLM-ready abstraction).
- **Phase 7** — Mobile polish + perf pass (Lighthouse, dynamic imports, bundle audit).

Do not start a deferred phase until the prior one is verified end-to-end with the user.

## Scope rule

All work stays inside `/Users/salihalif/Desktop/My-Projects/bfresh`. Do not modify files outside it.
