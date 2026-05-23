# B-FRESH Executive Operations Cockpit — Architecture & UX Blueprint

> Premium management cockpit for a ~100-branch retail food & beverage franchise network.
> Status: **architecture-only**. No backend, schema, or integration changes. Replaces / extends frontend layer only.

---

## 0. North-Star

Feels like **Monday + Power BI + Linear + Apple**:

- One-glance executive truth
- Two-tap drill from network → branch → specific ticket
- Native-feel mobile cockpit for franchisees and area managers in the field
- Hebrew/RTL first, English secondary
- Motion that feels intentional, never decorative
- Dark surfaces optional, light is default

**Three product modes** the same codebase supports:

| Mode | Audience | Default view |
|---|---|---|
| **Command** | C-level / HQ ops director | Network-wide cockpit |
| **Region** | Regional manager | Their branches grid + alerts |
| **Field** | Franchisee / service tech / area mgr | Single branch / single ticket queue |

Mode is auto-detected from the user role; persona switcher allows manual override.

---

## 1. Information Architecture (Sitemap)

```
/                                  Command Center (Executive)
├── /overview                      [alias of /, deeplinkable]
│
├── /network                       Network Intelligence
│   ├── /regions                   Region comparison
│   ├── /branches                  Branch grid + ranking
│   └── /branches/[id]             Branch 360° profile
│       ├── /overview
│       ├── /tickets
│       ├── /maintenance
│       ├── /inspections
│       ├── /marketing
│       ├── /staffing
│       └── /timeline
│
├── /customer-service              CS Cockpit
│   ├── /queue                     Live ticket queue
│   ├── /complaints                Complaints analytics
│   ├── /categories                Drill-by-category
│   ├── /sla                       SLA performance + breach log
│   └── /tickets/[id]              Ticket profile (drill-down panel + page)
│
├── /maintenance                   Construction & Maintenance
│   ├── /calls                     Service-call queue
│   ├── /suppliers                 Supplier scorecard
│   ├── /recurring                 Recurring-failure detection
│   ├── /equipment                 Equipment health
│   ├── /renovations               Renovation projects
│   └── /technicians               Technician performance
│
├── /recruitment                   HR Recruitment
│   ├── /pipeline                  Funnel view
│   ├── /demand                    Branch staffing demand map
│   ├── /sources                   Source effectiveness
│   └── /candidates/[id]           Candidate profile
│
├── /franchise                     Franchise Pipeline
│   ├── /leads                     Lead board (Kanban)
│   ├── /funnel                    Conversion funnel
│   ├── /meetings                  Meeting history
│   └── /candidates/[id]           Franchise-candidate profile
│
├── /marketing                     Marketing Cockpit
│   ├── /campaigns
│   ├── /coupons                   Coupon activity (placeholder data)
│   ├── /loyalty                   Membership club performance
│   └── /satisfaction              CSAT / NPS trends
│
├── /insights                      AI Copilot (rule-based now, LLM-ready)
│   ├── /alerts                    Anomaly + threshold alerts
│   └── /recommendations           Actionable recommendations log
│
├── /forms                         Dynamic Forms Engine (existing)
│
└── /system
    ├── /settings
    ├── /integrations              Monday / WhatsApp health
    └── /audit
```

**Routing conventions:**

- All `[id]` pages support **both** a full-page route and a slide-over panel when navigated from a list (URL syncs to `?drill=<id>`).
- Every filter combination is URL-serialisable (`?branch=b-tlv&dr=30d&sla=breached`) → bookmarkable & shareable.
- `/branches/[id]` is **canonical** — every reference to a branch links here.

---

## 2. Navigation System

### Desktop (≥1024)

- **Fixed sidebar 264px** — persona-aware grouping (see below).
- **Sticky frosted top header** — search + persona switcher + density toggle + system status + notifications + refresh.
- **Optional secondary tabs bar** inside each cockpit (e.g. Customer Service → Queue / Complaints / SLA).

### Tablet (768–1023)

- Sidebar collapses to **icon rail** (64px) with tooltip labels on hover.
- Header keeps full controls.

### Mobile (<768)

- Sidebar → **bottom navigation** (5 tabs: Home · Network · CS · Maintenance · More).
- "More" opens a full-height sheet with all destinations grouped by department.
- Header compresses: brand + search-icon + bell + avatar.
- **Sticky filter chip bar** under header — horizontally scrollable, shows active filters as removable chips.

### Persona-aware sidebar grouping

```
COMMAND                     REGION                    FIELD
─────────                   ──────                    ─────
• Cockpit                   • My Region              • My Branch
• Network                   • Branches in region     • My Tickets
• Customer Service          • Inspections            • Maintenance Calls
• Maintenance               • Maintenance            • Forms
• Recruitment               • Recruitment            • Insights
• Franchise                 • Insights
• Marketing                                          SYSTEM
• Insights                  SYSTEM                   • Settings
                            • Settings
SYSTEM
• Settings
• Integrations
• Audit
```

Persona switch is **never destructive** — just changes default landing + sidebar grouping. All routes remain reachable.

---

## 3. Executive Command Center (`/`)

Single-screen cockpit. Five horizontal bands stacked top-down.

### Band 1 — Hero / Executive Summary

| Element | Notes |
|---|---|
| Brand-gradient band | Already in place |
| Live env + Hebrew long-date + system status | Ping dot · "מחובר · ייצור" / "דמה" |
| Title + AI-copilot subline | "מתעדכן ברקע" |
| 2 hero pills | Open tickets · SLA % (animated counters) |

### Band 2 — Pulse Strip (KPI Row)

Eight cards, 4 per row on mobile, 8 across on xl. Each card:

- Icon tile · label · big animated number · 14d sparkline · trend pill · color top-bar by metric type · click → drill page.

**Recommended 8 KPIs** (replace current 6):

| # | KPI | Tone | Drill target |
|---|---|---|---|
| 1 | Open tickets | blue | /customer-service/queue |
| 2 | SLA breaches (24h) | rose | /customer-service/sla |
| 3 | Avg resolution time | amber | /customer-service/sla |
| 4 | Completed today | green | /customer-service/queue?state=done |
| 5 | Active maintenance calls | violet | /maintenance/calls |
| 6 | Network health score (0-100) | cyan | /network/branches |
| 7 | Open franchise leads | blue | /franchise/leads |
| 8 | Open recruitment reqs | green | /recruitment/demand |

### Band 3 — Operational Intelligence (3-column grid)

| Column | Widget |
|---|---|
| Left (2-span) | **Network Heatmap** — map or grid heatmap of branches colored by health score. Hover → mini-profile tooltip. Click → branch page. |
| Right (1-span) | **AI Copilot** — sorted insights (importance), confidence bars, expandable recommendations, action CTAs. |

### Band 4 — Department Strip (3 cards)

Each card is a "department pulse" with 3 micro-KPIs + sparkline + "open dept →" link.

- **Customer Service** — open tickets · SLA % · avg first response
- **Maintenance** — open calls · MTTR · top supplier issue
- **Franchise + Recruitment** combined — leads in pipeline · interviews this week · conversion %

### Band 5 — Live Streams (2-column)

| Left | Right |
|---|---|
| **SLA Priority Queue** — top 8 critical/medium breaches with quick "open" action | **Branch Ranking Table** — top 10 / bottom 5 branches by health score, with delta vs last week |

### Band 6 — Recent Activity Timeline

Full-width activity feed: tickets opened/closed, alerts triggered, inspections completed, leads moved. Filterable by department.

---

## 4. Multi-Level Drill-down Architecture

### Pattern: **Slide-over first, dedicated page second**

Click any data point → opens a **right-side slide-over panel** (desktop) or **bottom sheet** (mobile) with full detail + "open as page" affordance. URL updates with `?drill=<id>` so panel state is shareable.

### Drill chains (declared, not invented per widget)

```
Complaints (KPI) ─▶ Categories breakdown ─▶ Category drill ─▶ Branch heatmap ─▶ Branch tickets ─▶ Ticket panel
Region card     ─▶ Region branches grid  ─▶ Branch 360°    ─▶ Tickets/Maint/Inspections tabs    ─▶ Item panel
Maintenance KPI ─▶ Calls queue           ─▶ Supplier card  ─▶ Recurring failures                ─▶ Call panel
Franchise KPI   ─▶ Funnel by stage       ─▶ Stage candidates ─▶ Candidate profile               ─▶ Meeting log
SLA breach pill ─▶ Breach log            ─▶ Ticket panel
```

### Drill UI primitives

- **`<DrillPanel>`** — shadcn Sheet wrapper, max width 560px desktop / 92vh sheet mobile; header with breadcrumbs + close + "open as page" button.
- **`<DrillBreadcrumbs>`** — context trail "מרכז → תלונות → שירות → תל אביב מרכז → #9001245"; each crumb is clickable.
- **`<DrillTabs>`** — when a drill target has subviews (overview / activity / related), tabs inside the panel.
- **Back-stack** — pressing back on mobile pops the panel, never the page.

### Animations

- Panel slides in from the **start edge** (right in RTL) using `SPRING_SMOOTH`.
- Sheet on mobile uses spring-snap with edge resistance.
- Crumb transitions: subtle fade-cross (180ms) when context updates without panel close.

---

## 5. Branch Intelligence View (`/branches/[id]`)

The **most valuable** screen for regional managers and franchisees.

### Hero strip
- Branch name · region · manager avatar
- Health score (0-100) as large radial gauge — colored
- 4 status pills: SLA · Maintenance · Inspection · Staffing
- Last visit, last inspection date, last incident

### Tabs (sticky)

```
סקירה │ פניות │ אחזקה │ ביקורות │ שיווק │ צוות │ ציר זמן
```

### Tab content

| Tab | Widgets |
|---|---|
| **סקירה (Overview)** | 4 sparkline KPIs · trend chart (12 weeks) · 3 latest alerts · manager-notes glass card |
| **פניות** | Tickets table · category donut · response-time heatmap · top recurring complaint |
| **אחזקה** | Open calls · suppliers used (donut) · failure-recurrence list · equipment status grid |
| **ביקורות** | Inspection score trend · last inspection details · open action items |
| **שיווק** | Active campaigns affecting branch · coupon redemption · CSAT trend · membership-club KPIs |
| **צוות** | Open recruitment reqs · current shifts (placeholder) · staffing shortage warnings |
| **ציר זמן** | Vertical timeline: tickets / inspections / maintenance / hiring events, filterable by type |

### Health Score formula (recommended)

```
health = 0.35 × SLA_compliance%
       + 0.20 × (100 − complaint_rate_per_1k_visits)
       + 0.15 × inspection_avg_score
       + 0.15 × maintenance_uptime%
       + 0.10 × staffing_fill%
       + 0.05 × CSAT
```

Stored as a derived metric; exposed via `mondayService.getBranchHealth(branchId)`. Recompute hourly. Color buckets: `≥85 emerald`, `70-84 amber`, `<70 rose`.

### Alert primitives on branch profile

- **Recurring issue** — same complaint category 3+ times in 30 days → red badge "תקלה חוזרת"
- **SLA risk** — open ticket >80% of SLA budget → amber clock badge
- **Inspection overdue** — last inspection >90 days → blue calendar badge
- **Staffing shortage** — open req >14 days → violet user badge

---

## 6. Global Filter System

Single Zustand store backs all filter state; URL is canonical (sync both ways).

### Filter taxonomy

| Filter | Type | Cross-page? | Persist? |
|---|---|---|---|
| `branchId` / `branchIds[]` | multi | yes | url + store |
| `regionId` | single | yes | url + store |
| `dateRange` | preset + custom | yes | url + store |
| `category` | multi | yes (CS, complaints) | url + store |
| `priority` | enum | yes | url + store |
| `supplierId` | multi | yes (maint) | url + store |
| `franchiseeId` | single | yes (franchise, branch) | url + store |
| `slaState` | enum | yes | url + store |
| `status` (open/closed) | enum | yes | url + store |
| `severity` | enum | yes (complaints) | url + store |
| `assigneeId` | multi | yes | url + store |
| `source` | enum | yes (recruitment, leads) | url + store |

### Filter Bar UX

- **Pill-style** — already in place; extend with multi-select (chip-in-chip).
- **Active count badge** + reset, already present.
- **Saved views** — name a filter combo, pin to header dropdown ("My franchise calls", "Open SLA breaches > 2h").
- **Smart suggestions** — if user filters by branch + status=breached, suggest "view in priority queue".

### Filter propagation rule

> Filters set on Command Center apply to **every widget on that page**.
> Filters set inside a department cockpit (e.g. CS) scope **only that cockpit**.
> Filters set inside a branch profile scope **only that branch profile**.
> Switching department clears that department's filters but keeps global Command filters.

This single rule prevents the most common BI confusion.

---

## 7. Widget Catalog

Reusable widgets — all live under `src/components/widgets/`. Each takes `{ data, loading, filters, density }` props.

### Numerical
- `KpiCard` (existing, polished)
- `MetricStat` — small inline KPI for dept strips
- `Gauge` — radial 0-100 (for Health Score)

### Charts (ECharts-backed)
- `TrendLine` (with brush + tooltip)
- `AreaSeries` (single + stacked)
- `Donut` (status / category)
- `Heatmap` (responseHeatmap pattern, also for branch grid map)
- `Funnel`
- `BarRanking` (with target line)
- `Sparkline` (svg, inline)
- `ScatterMap` (branch geo, optional Phase 4+ when coordinates available)

### Lists / queues
- `PriorityQueue` (SLA alerts pattern, generalized)
- `ActivityTimeline` (vertical, grouped by day)
- `KanbanBoard` (franchise leads, recruitment pipeline)

### Tables
- `RankingTable` (top/bottom toggle, delta column)
- `DataTable` (TanStack, density-aware, already in place)
- `ComparisonTable` (region vs region, branch vs network avg)

### Drilldown
- `DrillPanel` (Sheet wrapper)
- `DrillBreadcrumbs`
- `DrillTabs`
- `MiniProfileTooltip` (hover on branch dot in heatmap)

### Intelligence
- `InsightCard` (existing, with confidence bar + recommendation)
- `AnomalyBadge` (red flag with explanation tooltip)
- `RecommendationCard` (actionable, with "apply" CTA)

### Mobile-specific
- `BottomNav`
- `FilterChipScroller` (sticky chip bar)
- `SheetDrill` (mobile variant of DrillPanel)
- `PullToRefresh`

### Empty / state
- `EmptyState` (already)
- `ErrorState` (already)
- `LoadingShimmer` (already)
- `MaintenanceMode` (banner for integration downtime)

---

## 8. KPI Recommendations by Department

> Numbers are recommended targets, not commitments — adjust to business reality.

### Customer Service

| KPI | Definition | Target | Severity ladder |
|---|---|---|---|
| First Response Time | Open → first agent touch | < 30 min | >60 → amber, >120 → rose |
| Resolution Time (median) | Open → done | < 8 h | >24 → amber, >72 → rose |
| SLA Compliance | % closed inside SLA budget | ≥ 90% | <85 → amber, <75 → rose |
| Recurring Complaint Rate | Same category 3+ times in 30d per branch | < 5% | >10 → rose |
| CSAT | Post-resolution survey | ≥ 4.3 / 5 | <4.0 → rose |
| Open Volume | Snapshot open tickets | trend-tracked | spike >+20% wow → amber |

### Maintenance

| KPI | Definition | Target |
|---|---|---|
| MTTR | Mean time to repair | <6h critical, <48h normal |
| First-Time Fix Rate | % resolved in 1 visit | ≥ 80% |
| Recurring Failure Rate | Same equipment failure within 30d | < 8% |
| Supplier SLA Score | Per-supplier on-time % | ≥ 90% |
| Maintenance Backlog | Open >14d | minimize |
| Cost per Branch (placeholder) | Monthly maintenance spend | tracked |

### Regional Managers

| KPI | Definition |
|---|---|
| Region Health Score | Avg health of region's branches |
| Top/Bottom Branch | Highest / lowest health in region |
| Overdue Actions | Inspection actions past due |
| Trend vs Network | Region trajectory compared to network avg |
| Alerts Triggered (7d) | Count of severity≥medium |

### Recruitment

| KPI | Definition | Target |
|---|---|---|
| Time-to-Hire | Application → start | < 21 days |
| Pipeline Velocity | Stage→stage avg days | < 5 days |
| Source Conversion | Hires / candidates per source | tracked |
| Open Reqs Aging | Days open per requisition | <30 |
| Hire-to-Demand Ratio | Hires made / demand opened | ≥ 0.7 |

### Franchise

| KPI | Definition | Target |
|---|---|---|
| Lead → Meeting | First-stage conversion | ≥ 35% |
| Meeting → Signed | Final conversion | ≥ 10% |
| Avg Funnel Time | Lead to signed | < 90d |
| Candidate Score (composite) | Internal scoring rubric | tracked |
| Pipeline Value (count + projected) | Active leads | tracked |

### Marketing

| KPI |
|---|
| Active campaigns count |
| Coupon redemption rate (placeholder until data) |
| Membership growth rate |
| CSAT trend |
| Branch participation rate in campaigns |

---

## 9. Component System (Design Tokens)

Extend the existing token base — don't replace.

### Color tokens

```
--bfresh-blue        (primary)
--bfresh-fresh-green (success / positive)
--bfresh-light-blue  (info accents)

Status tokens:
--status-success     (emerald)
--status-warning     (amber)
--status-danger      (rose)
--status-info        (blue)
--status-neutral     (muted)
--status-violet      (franchise/marketing accent)
--status-cyan        (analytics accent)
```

Apply via Tailwind utility classes already wired through `@theme inline`.

### Spacing scale (density-aware)

```
--density-card-padding   1.25rem (comfortable) / 0.9rem (compact)
--density-row-height     3.25rem / 2.5rem
--density-section-gap    1.5rem  / 1rem
--density-table-padding  0.75rem / 0.5rem    (new)
```

### Radii

```
--radius-sm  0.5rem    (chips, small badges)
--radius-md  0.625rem  (inputs, buttons)
--radius-lg  0.75rem   (cards default)
--radius-xl  1rem      (hero, large surfaces)
--radius-pill 999px
```

### Elevation

```
.elev-1 / .elev-2  — layered shadow (already in place)
.premium-card      — depth + inner highlight + soft border (already in place)
.glow-{tone}       — accent halo (already in place)
```

### Motion presets (already in `src/lib/motion.ts`)

```
SPRING_BOUNCE   380 / 32 / 0.6   — toggles, buttons
SPRING_SMOOTH   220 / 28 / 0.7   — layout, panels
EASE_OUT        0.42s cubic      — fades
stagger delay   0.045s           — grid entry
```

### Typography

- Display: Assistant
- Body / numeric: Heebo
- Mono: ui-monospace fallback
- Sizes: 12 / 13 / 14 / 16 / 20 / 24 / 28 / 36 px
- Numbers always **tabular-nums** in KPIs and tables

### Iconography

Lucide only. Persona uses dedicated icon: `LayoutDashboard` · `Network` · `Users` · `Wrench` · `Megaphone` · `Sparkles` · `FileText`.

---

## 10. Mobile UX Structure (Primary, not secondary)

### Layout primitives

| Region | Mobile pattern |
|---|---|
| Top | Compact header — brand + search-icon + bell + avatar (56px) |
| Filters | Sticky chip-scroller under header (40px) |
| Body | Single-column cards, gap = `--density-section-gap` |
| Drill | Bottom sheet (vaul / shadcn Sheet bottom) with snap-points 50%/90% |
| Nav | Bottom 5-tab nav with center-FAB for "create" |

### Bottom navigation (5 tabs)

```
[ Home ]   [ Network ]   [ + ]   [ CS ]   [ More ]
```

- "+" opens a quick-action sheet: new ticket / new lead / new maintenance call / scan-to-check-in
- Tabs are persona-aware: a franchisee sees `My Branch` instead of `Network`.

### Touch targets

- All buttons ≥ 44px hit zone (even when visually smaller via padding).
- Cards have full-card tap area for primary action; secondary action revealed on long-press.

### Swipe interactions

- Ticket card swipe-left = quick-close.
- Ticket card swipe-right = assign to me.
- SLA alert swipe = snooze.
- Branch card horizontal swipe within a row = scroll through branches.

### Safe areas

- `padding-bottom: env(safe-area-inset-bottom)` on bottom nav + main.
- `padding-top: env(safe-area-inset-top)` on header.
- No content under iOS home bar.

### Pull-to-refresh

Native-style on every list view, hooks into TanStack Query `refetch()`.

### Mobile-only screens

- `/m/inspection/[id]` — touch-optimized inspection checklist with photo upload (offline-friendly when possible).
- `/m/scan` — QR / barcode entry point to a branch profile.

### Performance budget (mobile)

- LCP < 2.0s on 3G fast (mock data)
- Bundle for `/` route < 220 KB gzipped initial
- Code-split ECharts; load on viewport intersection for below-the-fold charts

---

## 11. Visual Design System

### Surface hierarchy

1. **Page background** — pearl-radial atmosphere (in place).
2. **Section surface** — none; sections breathe directly on atmosphere.
3. **Premium card** — `.premium-card`, layered shadow + inner highlight.
4. **Inner card / tile** — flat `bg-muted/40`, no shadow, smaller radius.
5. **Modal / sheet** — solid `var(--card)` + `.elev-2`.

### Glass-tier usage

| Use case | OK |
|---|---|
| Hero pills | ✅ |
| Frosted header | ✅ |
| Sidebar (subtle) | ✅ |
| Branch profile gauge surround | ✅ |
| Dense tables / inputs | ❌ — readability matters more |

### Color usage rules

- **One primary accent per screen** — brand blue or brand green, never both at equal weight.
- **Status colors** drive emotional tone — never decorative.
- **Gradients** appear only on: brand surfaces (hero, active sidebar, top bar of premium cards), KPI bars, progress bars. Never on body text, never as page background.

### Dark mode

`.dark` class already wired. Premium card adapts via OKLCH lightness; tweak inner highlight to `oklch(1 0 0 / 0.05)` for dark. Atmosphere becomes deeper teal-navy.

### Empty / loading / error consistency

Same triad of components everywhere:
- **EmptyState** with radial glow halo (in place)
- **ErrorState** with retry (in place)
- **Shimmer** for skeleton (in place; replaces pulse-only)

---

## 12. Executive Workflow Logic

The cockpit must reward 15-second scans, 60-second drill-downs, and 5-minute deep dives.

### "15-second scan" (Hero + Pulse Strip)

CEO opens app — within 15s sees: network health · 24h breaches · open tickets · trend arrows. If everything green, exits. If any red pill, taps.

### "60-second drill"

Red pill → priority queue → tap critical ticket → panel opens with full context · assignee · branch · history · suggested action. CTA "פתח ב-Monday" or "הקצה ל…" or "סלים".

### "5-minute deep dive"

From a branch profile, switch tabs to identify recurring issue · check supplier scorecard · open recommendation card · trigger an action.

### Persona-default landing

| Persona | Landed on |
|---|---|
| HQ exec | `/` Command |
| Regional mgr | `/network/regions?focus=<myRegion>` |
| Franchisee | `/branches/<myBranch>` |
| CS team lead | `/customer-service/queue` |
| Maintenance ops | `/maintenance/calls` |
| Recruiter | `/recruitment/pipeline` |
| Franchise dev | `/franchise/leads` |

Each landing has its own "what changed since you last visited" banner (top of page) — counts of new tickets, closed items, SLA breaches, lead movements.

### "Action of the day" pattern

Hero band can offer a single high-confidence recommendation:
> "המלצה ליום: הוסף נציג ל-תל אביב מרכז 18:00-21:00 · השפעה צפויה: −22% SLA breaches"
With "אשר" / "דחה" buttons. Logged to `/insights/recommendations`.

---

## 13. AI Insights Layer — Roadmap

Today: rule-based (already implemented).
Next: layered upgrade path that does **not** require an LLM until the data foundation is ready.

### Phase A — Rule engine (done / extend)

- Variance vs baseline (weekly delta)
- Top/bottom performer detection
- Peak-hour identification
- Recurring-issue detection
- SLA-risk early warning (ticket > 80% budget)

### Phase B — Statistical anomaly detection

- Rolling mean + 2σ band per branch metric → flag outliers
- Seasonality-aware (DoW / hour) using STL decomposition (lightweight, run server-side)
- "Z-score badge" on KPIs that drift

### Phase C — Forecasting

- Holt-Winters / Prophet for ticket volume per branch (1-2 week horizon)
- Capacity-planning charts: predicted vs actual response time

### Phase D — LLM Copilot (optional, gated)

- Natural-language Q&A against the dashboard (`"כמה תלונות חוזרות יש בתל אביב מרכז?"`)
- Recommendation generation grounded in retrieved facts (RAG over Monday + complaints DB)
- Server-side only, never expose model keys — route via `/api/insights/copilot`
- Default model via Vercel **AI Gateway** for provider-agnostic routing

### Insight schema (already extended)

```ts
type AIInsight = {
  id: string;
  kind: "positive" | "warning" | "info";
  importance?: "high" | "medium" | "low";
  confidence?: number; // 0..1
  title: string;
  detail: string;
  metric?: string;
  recommendation?: string;
  // Phase B+:
  evidence?: { metric: string; value: number; baseline: number; sigma: number }[];
  affectedBranches?: string[];
  suggestedAction?: { kind: "open"; route: string } | { kind: "notify"; persona: string };
};
```

### Pulse pattern for AI surfaces

- Subtle radial pulse on Copilot icon (in place).
- Confidence bar per insight (in place).
- "Why" disclosure shows evidence sources.

---

## 14. Implementation Phases (Frontend only — no backend changes)

### Phase 1 — Cockpit foundation upgrade *(extends current dashboard)*

- Replace `/` with the Command Center layout (Hero + Pulse Strip 8 KPIs + Department Strip + Live Streams + Activity Timeline).
- Persona switcher in header.
- Saved views in filter bar.

**Files touched:** `src/app/page.tsx`, `src/app/DashboardClient.tsx`, `src/components/widgets/*` (new), `src/lib/stores/persona.ts` (new), `src/lib/stores/filters.ts` (extend).

### Phase 2 — Network Intelligence

- `/network/regions` + `/network/branches` + `/branches/[id]` (overview tab).
- Branch heatmap widget.
- Health score derivation (client-side from existing mock; future: server endpoint).

### Phase 3 — Customer Service cockpit

- `/customer-service/queue`, `/sla`, `/complaints`, `/categories`.
- DrillPanel + DrillBreadcrumbs primitives.
- Ticket profile panel + page.

### Phase 4 — Maintenance cockpit

- `/maintenance/calls`, `/suppliers`, `/recurring`, `/equipment`.
- Supplier scorecard widget.
- Recurring-failure detection list.

### Phase 5 — Recruitment + Franchise

- Kanban widget.
- Funnel widget extended.
- Candidate profile panels.

### Phase 6 — Branch 360° tabs

- All 7 tabs on branch profile.
- Activity timeline.
- Manager-notes card (write-back via existing service).

### Phase 7 — Mobile pass

- Bottom nav.
- Filter chip scroller.
- Bottom-sheet drill.
- Swipe actions.
- Safe-area + pull-to-refresh.

### Phase 8 — AI Phase B (statistical) + Saved Views + Action of the Day

- Server-side anomaly detection.
- Persisted saved views.
- Daily recommendation surfaced on Command Center hero.

### Phase 9 — LLM Copilot (only when Monday API + complaints DB wiring lands)

- `/insights/copilot` chat panel.
- Vercel AI Gateway integration.
- Audit log.

---

## 15. Untouchables (do not change)

- Monday.com integration shape — keep `MondayService` interface stable; only add methods.
- WhatsApp automation pipelines.
- Existing forms engine and submission endpoints.
- Auth (deferred; system rules: no DB / no auth).
- Routing semantics already in production for existing sub-pages (`/employees`, `/branches`, `/sla`, `/insights`, `/forms`).
- Data shapes in `src/types/domain.ts` — *extend* never break.

---

## 16. Suggested directory growth

```
src/
  app/
    (cockpit)/                   route group — shared layout w/ persona-aware header
      page.tsx                   Command Center
      network/...
      branches/[id]/...
      customer-service/...
      maintenance/...
      recruitment/...
      franchise/...
      marketing/...
      insights/...
  components/
    cockpit/                     band-level compositions (HeroSummary etc.)
    widgets/                     reusable widget library (KpiCard, Gauge, Heatmap, …)
    drill/                       DrillPanel + DrillBreadcrumbs + DrillTabs
    branch/                      Branch 360° tabs + HealthGauge + Timeline
    nav/                         BottomNav, PersonaSwitcher, SavedViews
  services/
    monday/                      existing — extend methods only
    analytics/                   derive health score, recurrence detection, anomaly stats
    forms/                       existing
  lib/
    stores/
      filters.ts (existing — extend)
      ui.ts (existing — density)
      persona.ts (new)
      savedViews.ts (new)
    motion.ts (existing)
    health.ts (new — score formula)
    insights.ts (new — rule engine)
  types/
    domain.ts (extend, never break)
```

---

## 17. Success Criteria

The cockpit succeeds when:

1. CEO can open the app on phone in elevator and know if today is green or red in **under 15 seconds**.
2. Regional manager can identify their weakest branch and its top issue in **under 30 seconds**.
3. CS team lead can find the worst SLA breach right now and assign it in **under 60 seconds**.
4. Mobile lighthouse perf ≥ 90 on `/` with mock data.
5. Zero broken existing routes / forms / Monday calls / WhatsApp automations.
6. Every screen has a state for: loading · empty · error · partial data.
7. Every metric explains itself on hover (tooltip with definition).
8. Every red flag links to the action that resolves it.

---

*Document version 0.1 — architecture-only. No production code modified by this plan.*
