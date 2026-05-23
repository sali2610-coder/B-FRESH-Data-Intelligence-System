# B-FRESH Operational Intelligence Platform

The frontend cockpit is the visible layer. Behind it sits a normalized
domain model and an intelligence engine that converts raw Monday rows
into actionable, auditable operational truth.

This document is the architecture reference for that backend layer.

---

## 1. Three layers

```
┌────────────────────────────────────────────────────────────────────┐
│  Frontend cockpit  (Hero · KPIs · Heatmap · Activity · Branch 360) │
│  Reads: useDashboard, useBranchProfile, useConnection              │
└────────────────────────────────────────────────────────────────────┘
                  ▲ DashboardData / BranchProfile (UI types)
                  │
┌────────────────────────────────────────────────────────────────────┐
│  Intelligence layer  (src/services/intelligence/)                  │
│  IntelligenceSnapshot ◀── renderer ──▶ DashboardData               │
│         ▲                                                          │
│  aggregator → processors → snapshot                                │
└────────────────────────────────────────────────────────────────────┘
                  ▲ NormalizedTicket[]
                  │
┌────────────────────────────────────────────────────────────────────┐
│  Monday I/O layer  (src/lib/monday/ + src/services/monday/live.ts) │
│  client → GraphQL → normalize → batches                            │
│  config: src/config/mondayBoards.ts                                │
└────────────────────────────────────────────────────────────────────┘
```

Mock pipeline is parallel: `mockBuilder` produces an `IntelligenceSnapshot`
directly from `src/mocks/seed.ts`, then flows through the **same** renderer,
briefing generator and AI endpoints.

---

## 2. Central normalized data model

`src/domain/entities.ts` defines every entity. UI never reads source rows.

| Entity | Purpose |
|---|---|
| `BranchEntity` | Operational location · region · franchisee · manager |
| `EmployeeEntity` | Staff member · role · branch link |
| `ComplaintEntity` | Customer-service ticket (category · source · sentiment) |
| `MaintenanceEntity` | Service call (supplier · equipment · cost) |
| `InspectionEntity` | Branch inspection score |
| `MarketingCampaignEntity` | Campaign / coupon activity |
| `RecruitmentLeadEntity` | Hiring pipeline candidate |
| `FranchiseLeadEntity` | Franchise candidate |
| `SLAEventEntity` | **derived** — every SLA breach event |
| `AlertEntity` | **derived** — operational alert with severity/kind |
| `InsightEntity` | **derived** — AI-ready insight with confidence + recommendation |

Every entity carries a `provenance` field (`src/domain/provenance.ts`):

```ts
type Provenance =
  | { source: "monday"; boardId; boardName; itemId; fetchedAt; mappingVersion }
  | { source: "mock";   seed;    fetchedAt; mappingVersion }
  | { source: "derived"; inputs; formula; computedAt; mappingVersion };
```

Every computed metric goes through `metric(value, formula, inputs)` →
`{ value, provenance: { source: 'derived', ... } }`. Any number on screen
is traceable to its source items + formula.

---

## 3. Multi-board architecture

`src/config/mondayBoards.ts` extends `MondayBoardConfig` with:

```ts
{
  id: string;
  name: string;
  department: BoardDepartment;
  entityType: 'complaint' | 'maintenance' | 'inspection' |
              'marketing_campaign' | 'recruitment_lead' | 'franchise_lead';
  columns: BoardColumnMap;             // column-id mapping per entity
  statusNormalization?: { open?: string[]; in_progress?: string[]; ... };
  slaRules?: { responseBudgetMinutes?; resolutionBudgetMinutes?; breachMultiplier? };
  enabled?: boolean;
}
```

Add a new board → register entry → restart → it flows into the snapshot
on next request. No UI code change.

`getBoardsByDepartment(dept)` / `getBoardsByEntityType(type)` helpers exist
for the few places that need to slice the config.

---

## 4. Mapping layer

`src/services/intelligence/mapper.ts` dispatches per `board.entityType`:

```ts
mapToEntity(ticket, board) → ComplaintEntity | MaintenanceEntity | ...
```

Each mapper:
- pulls the configured columns
- runs `statusFromConfig` (board rules → fallback to default Hebrew regex)
- runs `deriveSlaState` (explicit SLA column → slaRules budget → "ok")
- stamps `mondayProvenance` so the entity is traceable

`deriveBranchFromTicket` and `deriveEmployee` synthesise branch and
employee entities from ticket fields until dedicated boards exist.

---

## 5. Intelligence engine

`src/services/intelligence/processors.ts` — pure functions over typed
entities. No I/O. Each processor is single-responsibility:

| Processor | Output | Purpose |
|---|---|---|
| `detectSLAEvents` | `SLAEventEntity[]` | All breaches with severity + minutes overdue |
| `detectComplaintSpikes` | `ComplaintSpike[]` | Recent vs baseline (28-day) per branch |
| `detectRecurringFailures` | `RecurringFailure[]` | Same equipment signature 3+× in 30 days |
| `detectStaffingShortages` | `StaffingShortage[]` | Open tickets per employee ratio |
| `detectEmployeeOverload` | `EmployeeOverload[]` | Per-employee load + breaches |
| `computeRegionalTrends` | `RegionalTrend[]` | Region-level rollup |
| `detectEscalations` | `EscalationEvent[]` | Critical / breached escalations |
| `computeBranchHealth` | `BranchHealthEntry[]` | Composite score (uses `src/lib/health`) |
| `synthesizeAlerts` | `AlertEntity[]` | Converts derived metrics into AlertEntities |
| `generateInsights` | `InsightEntity[]` | Rule-based insights with confidence + recommendation |

Pure functions = trivially testable, swappable for statistical / LLM
implementations in later phases without touching the aggregator.

---

## 6. Aggregator + renderer + briefing

```
aggregator.buildSnapshot(batches, mode)  → IntelligenceSnapshot
renderer.renderDashboardData(snapshot)    → DashboardData (UI)
briefing.generateBriefing(snapshot)       → ExecutiveBriefing (AI-friendly)
```

`IntelligenceSnapshot` carries:
- raw entities (branches, employees, complaints, maintenance, ...)
- derived metrics (slaEvents, branchHealth, spikes, recurring, ...)
- audit (`sourceBoards`, `totals`, `mappingVersion`, `fetchedAt`)

The renderer is an adapter to the legacy UI types so the cockpit keeps
working unchanged while the new layer ships.

The briefing produces a compact summary with: headline · what's burning ·
what improved · where attention is needed · strongest / weakest region ·
top priority actions with recommendations. AI-friendly shape ready for
LLM consumption.

---

## 7. API endpoints

| Route | Returns |
|---|---|
| `GET /api/intelligence/snapshot` | Full `IntelligenceSnapshot` |
| `GET /api/intelligence/snapshot?slim=1` | Snapshot without raw entity arrays (compact) |
| `GET /api/intelligence/briefing` | `ExecutiveBriefing` |
| `POST /api/intelligence/refresh` | Invalidates cached snapshot |
| `GET /api/monday/stream` | SSE channel — initial snapshot summary + alert deltas every 10s |
| `GET /api/monday/dashboard` | `DashboardData` (UI adapter) — unchanged contract |
| `GET /api/monday/status` | Connection status (mock / live / error) |
| `GET /api/monday/boards` | List boards |
| `GET /api/monday/board/[id]` | Board meta |
| `GET /api/monday/items` | Normalized tickets |
| `GET /api/monday/branch/[id]` | `BranchProfile` |

All API routes set `x-bfresh-source` header (`mock` | `live`) so any
client can distinguish the data origin without parsing the body.

---

## 8. Caching

`src/lib/cache.ts` — `TaggedCache` with TTL + tag invalidation +
in-flight de-duplication (concurrent requests share one fetch).

- Snapshot TTL: **60s** (configurable in `DispatchService`)
- Connection status TTL: **30s** (in `mode.ts`)
- Invalidate via `POST /api/intelligence/refresh` or `invalidateSnapshot()`

For multi-instance production: swap the backing store for Redis or Vercel
Runtime Cache — the interface (`getOrSet` + `invalidate`) stays.

---

## 9. Realtime architecture

Today: polling.
- TanStack Query refetch on focus + optional interval (`useDashboard({refetchIntervalMs})`)
- `/api/monday/stream` SSE emits initial state + alert deltas every 10s

Next: webhooks.
- Monday webhook → POST `/api/monday/webhook` → `invalidateSnapshot()` + push to SSE channel
- Client unchanged — already consumes SSE / polling indifferently

---

## 10. AI-ready architecture

Two clean inputs an LLM can consume:

**Slim snapshot** (`/api/intelligence/snapshot?slim=1`):
- networkScore, regionalTrends, branchHealth, alerts, insights, audit
- ≈10-30KB depending on network size — fits easily in any prompt

**Executive briefing** (`/api/intelligence/briefing`):
- Pre-structured: headline · whatBurning · whatImproved · whereAttention
  · strongestRegion · weakestRegion · topPriorityActions
- LLM just needs to wrap in prose

Both endpoints carry `provenance` on every entity → the model can cite
sources.

Recommended LLM access pattern (future Phase D):
- Server-side route `/api/intelligence/copilot` (Node runtime)
- Vercel AI Gateway with `"anthropic/claude-sonnet"` or similar
- Tool: `getSnapshot()` so the model can fetch fresh data mid-conversation
- Token never sent to client

---

## 11. Auditability

Every entity carries `provenance`. Every derived metric is computed by a
named formula and stores the inputs.

The `audit` block on `IntelligenceSnapshot` declares:
- `sourceBoards`: which Monday boards produced which entity types and how
  many items each contributed
- `totals`: per-entity-type counts
- `mappingVersion`: bump this in `src/domain/provenance.ts` when the
  normalisation rules change

Combined: any number on screen → entity → provenance → board + item ID.

---

## 12. Performance

Snapshot generation is O(items × boards). Boards are fetched sequentially
inside `liveGetTicketBatches` to respect Monday rate limits. Cache absorbs
repeated reads within 60s.

For 100+ branches × 1000s of items:
- Increase `MAX_PAGES_PER_BOARD` in `live.ts` to cover larger boards
- Lower `SNAPSHOT_TTL_MS` if data freshness matters more than load
- Consider a background warmup job (scheduled fetch) to keep the cache
  hot before user requests
- Branch profile already filters from the snapshot — no extra round-trip

---

## 13. Security

All Monday I/O is wrapped in `import "server-only"` modules:
- `src/lib/env.ts`
- `src/lib/monday/*`
- `src/services/monday/*` (live, mock, mode, index)
- `src/services/intelligence/*`

If a client component accidentally imports any of these, the build fails
loudly. Token is never logged, never JSON-serialised — only `tokenMasked`
ever leaves the server. `.env.local` is gitignored.

Internal mapping config (`src/config/mondayBoards.ts`) is **not** a
secret — it only contains board IDs + column IDs, no credentials — but
it is still bundled server-side (not exposed to the client) because the
mapping rules are operational IP.

---

## 14. Environment strategy

| Env | `BFRESH_DATA_MODE` | Token |
|---|---|---|
| Local dev | `auto` | optional — defaults to mock |
| Staging | `live` | staging token, staging boards in `mondayBoards.ts` |
| Production | `live` | production token |

Vercel project → Settings → Environment Variables → set per environment.
Never reuse a production token in preview deployments.

---

## 15. Data integrity rules

- Mock and live data **never mix** — a single source per snapshot
- Components import only from `hooks/` — zero `@/mocks/` imports
- `mockBuilder.ts` is the **only** consumer of `@/mocks/seed`
- New entity types: add to `EntityType` union → mapper case → processor
  if needed → renderer adapter (if it surfaces in the existing UI)

---

## 16. Roadmap (deferred)

- **Webhook ingestion** — replace polling with Monday webhooks → SSE push
- **Statistical anomaly detection** — rolling mean ± 2σ per branch metric
  in `processors.ts` (new function `detectStatisticalAnomalies`)
- **Forecasting** — Holt-Winters / Prophet for ticket volume per branch
- **LLM Copilot** — `/api/intelligence/copilot` with Vercel AI Gateway
- **Redis cache backend** — drop-in for `TaggedCache`
- **Audit log persistence** — write snapshot diffs to durable storage for
  post-mortem analysis

None of these require breaking the current API surface.
