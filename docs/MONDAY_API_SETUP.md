# Monday.com Live Data Setup

Wire B-FRESH to your real Monday.com account. The token never reaches the browser — every API call runs server-side.

---

## 1. Get a Monday API token

1. Open https://b-fresh.monday.com (or your workspace)
2. Click your avatar (top-right) → **Developers** → **My access tokens**
3. Create a new personal token with `boards:read`, `me:read` minimum
4. Copy the token — it shows once

> **Never commit the token.** It belongs in `.env.local` only.

---

## 2. Configure environment

Copy `.env.example` → `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:

```bash
MONDAY_API_TOKEN=eyJhbGciOi…
MONDAY_API_URL=https://api.monday.com/v2
MONDAY_API_VERSION=2024-10
BFRESH_DATA_MODE=auto   # auto | mock | live
```

| Mode | Behavior |
|---|---|
| `auto` (default) | Live if token present, mock otherwise. Falls back to mock + "Connection Error" badge on Monday outage. |
| `mock` | Always mock. Useful for design / demos / offline work. |
| `live` | Always live. Throws "Connection Error" badge if token is missing or invalid — never silently falls back. |

Restart `pnpm dev` after editing `.env.local`.

---

## 3. Map your boards

Open `src/config/mondayBoards.ts` and add one entry per board you want the dashboard to consume.

### Get board ID
Monday board URL → `https://b-fresh.monday.com/boards/1234567890` → `1234567890`.

### Get column IDs
Inside the board → hover any column header → ⋯ → **Edit column** → **Column ID** (top-right).

### Example entry

```ts
export const MONDAY_BOARDS: MondayBoardConfig[] = [
  {
    id: "1234567890",
    name: "תלונות לקוחות",
    department: "customer-service",
    description: "תלונות נכנסות מ-WhatsApp / טופס אתר",
    columns: {
      status:   "status",      // status column
      priority: "priority8",   // dropdown / color column
      branch:   "branch5",     // text or dropdown — branch name
      region:   "region",      // optional region column
      owner:    "people",      // people / assignee
      dueDate:  "date4",       // due date
      category: "dropdown1",   // complaint category
      sla:      "sla",         // SLA status column (text or status)
      source:   "source",      // origin / channel
    },
    enabled: true,
  },
];
```

Map only the columns you have — missing ones default to safe placeholders.

### Department buckets
`customer-service` · `maintenance` · `marketing` · `recruitment` · `franchise` · `inspections` · `operations` · `other`.

---

## 4. Test the connection

```bash
pnpm dev
```

1. Open http://localhost:3000
2. Check the header pill:
   - **Live Monday Data** (blue, pulsing) — token works, boards configured, data flowing
   - **Mock Mode** (warm) — running on `src/mocks/`
   - **Connection Error** (coral) — token rejected / network issue → falls back to mock
3. Hit the diagnostic endpoint directly:
   ```bash
   curl http://localhost:3000/api/monday/status
   ```
   Returns:
   ```json
   {
     "source": "live",
     "label": "live",
     "mode": "auto",
     "hasToken": true,
     "hasBoards": true,
     "accountName": "B-FRESH",
     "tokenMasked": "eyJh…AB2c",
     "error": null,
     "lastChecked": "2026-..."
   }
   ```

---

## 5. Available endpoints

All endpoints run on the server and respect the active data source.

| Route | Purpose |
|---|---|
| `GET /api/monday/status` | Connection status + mask + last-checked timestamp |
| `GET /api/monday/boards` | List of boards visible to the token |
| `GET /api/monday/board/[boardId]` | Single board: groups + columns + meta |
| `GET /api/monday/items?boardId=…&boardId=…` | Normalized tickets from one or more boards |
| `GET /api/monday/dashboard` | Processed `DashboardData` — KPIs, charts, branches, employees, activity, insights |
| `GET /api/monday/branch/[branchId]` | Full `BranchProfile` |

All responses include `x-bfresh-source: live|mock` header so any client (curl, monitoring) can tell modes apart.

---

## 6. Mock data isolation

Mock fixtures live **only** in `src/mocks/` (`seed.ts`, `branchProfile.ts`). They are consumed exclusively by `src/services/monday/mock.ts`.

No UI component imports from `src/mocks/`. All UI components receive data from React hooks (`useDashboard`, `useBranchProfile`) — which hit the route handlers, which dispatch to `live` or `mock` based on env.

To **completely disable mock mode** in production:

```bash
BFRESH_DATA_MODE=live
```

The dashboard will then show the "Connection Error" state instead of silently switching to mock if Monday is unreachable.

---

## 7. Adding a new board mapping

1. Add config entry to `src/config/mondayBoards.ts` (`enabled: false` first if testing)
2. Restart dev server
3. Hit `GET /api/monday/items?boardId=<ID>` to confirm shape
4. Flip `enabled: true` and reload the dashboard
5. New items automatically merge into `DashboardData`

The analytics layer (`src/services/monday/analytics.ts`) recomputes KPIs, branch health, activity feed and insights every request — no schema migration needed.

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Badge says **Connection Error** | Bad token, expired, or scopes missing | Regenerate token; ensure `boards:read` scope |
| `429` / "Complexity throttled" | Too many items per board over the rate cap | Lower `PAGE_SIZE` in `src/services/monday/live.ts`; reduce `MAX_PAGES_PER_BOARD`; cache results upstream |
| Dashboard shows **0 branches** even with valid token | Configured boards have no items matching `columns.branch` | Verify the `branch` column ID is correct; check Monday item values |
| Some KPIs look right, others empty | Specific column not yet mapped | Add the missing column id under that board in `mondayBoards.ts` |
| Status column not recognised as done/in-progress | Labels are non-Hebrew / unusual | Extend the regex patterns in `src/lib/monday/normalize.ts` (`DONE_LABELS`, `IN_PROGRESS_LABELS`, etc.) |
| Production deploy shows mock despite token set | `BFRESH_DATA_MODE=mock` in env or token missing in production | Confirm Vercel env vars match `.env.example` and redeploy |

---

## 9. Security guarantees

- `src/lib/env.ts` and all `src/lib/monday/*` files start with `import "server-only"` — Next.js refuses to bundle them into a client component.
- Token is **never** echoed in JSON responses. Status endpoint returns only a masked preview (`eyJh…AB2c`).
- All Monday calls go through `mondayRequest()`, which sets `Authorization` from `process.env` only.
- API routes use `runtime = "nodejs"` (token + outbound fetch run on Node, not on Edge).
- `.env.local` is in `.gitignore` (`.env*` pattern).

---

## 10. What stays untouched

- Routing — every existing page works in both modes.
- Component code — receives data only via hooks; no `import "@/mocks/…"` outside service.
- Mock fixtures — preserved verbatim for design/demo cycles.
- Visual system — brand DNA / tokens / motion are not affected by data source.

When the token is connected and at least one board is mapped, the dashboard begins serving real Monday data on next request. No code change required.
