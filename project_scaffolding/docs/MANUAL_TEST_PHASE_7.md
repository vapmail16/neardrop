# Phase 7 — Manual testing checklist (Ops console)

Use after **Phases 0–6** are green. Working directory: **`project_scaffolding/`**.

**References**

- Plan: `docs/NEARDROP_MVP_IMPLEMENTATION_PLAN.md` §9 Phase 7 (Ops Console Frontend).
- Web: Next.js — `/login?portal=ops`, protected `/ops/dashboard`, `/ops/map`, `/ops/parcels` (see `OpsNav`).
- Middleware: `apps/web/src/middleware.ts` + `apps/web/src/lib/server/ops-route-gate.ts` (cookie gate; login is public).
- Automated (ops-scoped Vitest): API `ops`, hooks `useOpsStats` / `useOpsAffiliateMapPins`, `OpsStatCards`, `OpsAffiliateMap`, `OpsParcelPipeline`, `OpsNav`, `ops-route-gate`, page integration for dashboard / map / parcels clients (**37** tests in **11** files). Plus **2** `LoginForm` cases for `portal=ops` (wrong role / happy path) in `LoginForm.test.tsx` → **39** ops-related unit/integration tests (plan target **25+**).
- E2E: `apps/web/src/__tests__/e2e/ops.spec.ts` — `ops-seed.ts` registers ops + affiliates + carrier + customer, uploads manifest, then browser: login → stats → map → parcels → reassign.
- Home ops links: `phase4-manual-checklist.spec.ts` §2.1 and `smoke.spec.ts` (`home-root` + NearDrop).

**Tester & environment**

| Field | Value |
| ----- | ----- |
| Tester name | Automated verification (IDE agent) — re-sign with a human name if required |
| Date | 2026-04-05 |
| Node.js (`node -v`) | v20.20.0 |
| PostgreSQL | Required for API + ops E2E seed (`DATABASE_URL` in root `.env`) |
| Branch / commit (`git rev-parse HEAD`) | `02ac5ee25c0aeccf9582b7bcebba049b27332c63` |

**URLs (defaults)**

- Web: `http://127.0.0.1:3020` (or `PLAYWRIGHT_BASE_URL`)
- API: `http://127.0.0.1:3010` (or `PLAYWRIGHT_API_ORIGIN`)

---

## 1. Automated gates (run first)

| # | Command | Expected | Pass (2026-04-05 agent run) |
| --- | --- | --- | --- |
| 1.1 | `npm run migrate` | Success (`Already up to date` OK). | Not re-run this session — run locally before E2E. |
| 1.2 | `npm run test` | All workspace Vitest suites pass. Web: **149** tests (**53** files); **1** skipped only if `.next` missing (`home-route-manifest`). | [x] |
| 1.3 | Ops-only Vitest (see below) | **37** tests, **11** files, exit **0**. | [x] |
| 1.4 | `npm run lint --workspace=@neardrop/web` | Exit **0**. | [x] |
| 1.5 | `npm run typecheck --workspace=@neardrop/web` | Exit **0**. | [x] |
| 1.6 | `npm run build --workspace=@neardrop/web` | Exit **0** (Next production build). | [x] |
| 1.7 | `npx playwright install chromium` (from `apps/web`) | Browsers available. | [x] (installed in agent env before E2E retry) |
| 1.8 | `npm run test:e2e --workspace=@neardrop/web -- src/__tests__/e2e/ops.spec.ts` | Exit **0**; ops golden path passes. | [ ] **FAIL** (see §1.10) |
| 1.9 | `npm run verify --workspace=@neardrop/web` | `lint` → `typecheck` → `test` → `build` all **0**. | [x] |

**Ops-only Vitest command (Phase 7 regression)**

```bash
cd apps/web && npx vitest run \
  src/lib/api/ops.test.ts \
  src/lib/hooks/useOpsStats.test.tsx \
  src/lib/hooks/useOpsAffiliateMapPins.test.tsx \
  src/lib/server/ops-route-gate.test.ts \
  src/components/ops \
  'src/app/ops/(protected)/dashboard/OpsDashboardClient.integration.test.tsx' \
  'src/app/ops/(protected)/map/OpsMapClient.integration.test.tsx' \
  'src/app/ops/(protected)/parcels/OpsParcelsClient.integration.test.tsx'
```

**Troubleshooting 1.8 / ops E2E**

1. Free ports **3010** / **3020**, or run `npm run dev` from repo root; Playwright `webServer` in `playwright.config.mjs` starts API + web if not reused.
2. `curl -sS http://127.0.0.1:3010/api/v1/health` → `success: true`, DB connected.
3. `ops.spec.ts` **`test.beforeAll`** calls `seedOpsE2EScenario()` against the API — failures there abort the suite (check API logs).
4. First-time: `cd apps/web && npx playwright install chromium`.

### 1.10 E2E bootstrap (fix 2026-04-05)

Playwright **`globalSetup` no longer calls the API** (it ran *before* `webServer`, so cold runs hit `ECONNREFUSED`). Carrier creds are created in **`ensure-carrier-creds.ts`** via `test.beforeAll` in `carrier.spec.ts` and `phase4-manual-checklist.spec.ts`. Ops seed stays in `ops.spec.ts` `beforeAll`.

Login specs wait for **`#email`** (visible) after `domcontentloaded` so Suspense / `useSearchParams` does not leave tests on the **Loading…** shell.

| Suite | Result | Notes |
| ----- | ------ | ----- |
| `ops.spec.ts` | Re-run locally | Requires **Postgres** + **`npm run migrate`**; `PLAYWRIGHT_FORCE_NEW_SERVER=1` needs DB or webServer times out at **180s**. |

---

## 2. Browser manual checks (Ops UX)

**Automated parity**

| Manual # | Covered by automation |
| --- | --- |
| 2.1 | `smoke.spec.ts` — `/` shows **NearDrop** + `home-root`; ops sign-in link present. |
| 2.3–2.5, 2.7–2.8 | `ops.spec.ts` (when E2E passes): login, stats cards, map list, parcel row, **Apply** reassignment. |
| 2.4, 2.6, 2.9–2.11 | Middleware + `LoginForm` tests cover much of auth shape; full browser pass still recommended below. |

**Prerequisite:** Ops user (register via API with `role: "ops"` or use seeded E2E password from `ops-seed.ts` pattern), or create via your admin flow.

| # | Step | Expected | Pass |
| --- | --- | --- | --- |
| 2.1 | Open `/` | **NearDrop**; link **Sign in (ops)** visible. | [ ] |
| 2.2 | Open `/login?portal=ops` | Subtitle **Operations console**; email + password + **Sign in**. | [ ] |
| 2.3 | Sign in as **ops** user | Redirect to `/ops/dashboard`; heading **Operations dashboard**; **Total parcels** / **Affiliate hubs** cards (`ops-total-parcels`, `ops-total-affiliates`). | [ ] |
| 2.4 | Private window: open `/ops/dashboard` **without** session cookie | Redirect to login with `portal=ops` and `returnTo` including `/ops/dashboard`. | [ ] |
| 2.5 | **Dashboard** — nav **Dashboard**, **Map**, **Parcels** | All links navigate; no console errors. | [ ] |
| 2.6 | **Map** (`/ops/map`) | Heading **Affiliate map**; list **ops-affiliate-map** when hubs exist; status chips (**verified** / **pending** / **rejected** colours). | [ ] |
| 2.7 | **Parcels** (`/ops/parcels`) | Heading **Parcel pipeline**; table shows parcels (or empty state); each row has hub **select** + **Apply**. | [ ] |
| 2.8 | Choose another hub for a parcel → **Apply** | Row updates / refetch; no uncaught error; on failure, **alert** with API message. | [ ] |
| 2.9 | `/login?portal=ops` — sign in as **carrier** (wrong role) | **Operations accounts only** (or equivalent) error; stay on login. | [ ] |
| 2.10 | **Sign out** (header) | Redirect to `/login?portal=ops`; protected `/ops/*` requires login again. | [ ] |
| 2.11 | Optional: `/ops/stats`, `/ops/affiliates` | If present in build, load without 500; may be minimal stubs. | [ ] |

**Notes**

- Until **§1.8** passes in your environment, treat **§2.3–2.8** as **required manual** confirmation for Phase 7 sign-off.
- **2.8** is the plan exit gate: *manual assign/reassign parcel to different Affiliate*.

---

## 3. Phase 7 sign-off

| # | Question | Pass |
| --- | --- | --- |
| 3.1 | All §1 automated rows green in **your** environment (including **1.8** ops E2E)? | [ ] |
| 3.2 | All §2 browser rows completed with no blocking UX issues? | [ ] |
| 3.3 | Ready to proceed to Phase 8 after explicit go-ahead? | [ ] |

**Sign-off**

- Tester: _____________________  
- Date: _____________________

---

## Appendix A — Automated run summary (2026-04-05, agent)

| Gate | Recorded result |
| --- | --- |
| `npm run test` (monorepo) | **PASS** — shared + api + web all green; web **149** tests (**1** skipped only if no `.next`). |
| Ops-scoped Vitest | **PASS** — **37** tests / **11** files. |
| `lint` / `typecheck` / `build` (`@neardrop/web`) | **PASS**. |
| `npm run verify` (`@neardrop/web`) | **PASS**. |
| `playwright install chromium` | **PASS** (after install). |
| `ops.spec.ts` | **FAIL** — timeouts (see §1.10); **re-run on developer machine** with DB + ports. |

---

## Out of scope for Phase 7 (this checklist)

Phase 8 polish, production deploy, full four-portal golden-path E2E, native mobile apps, real-time ops analytics beyond current stats API.

---

## Evidence block (copy when recording a run)

```text
Date:
Commit:
§1.2 test (web test count):
§1.3 ops Vitest (37 tests):
§1.4 lint:
§1.5 typecheck:
§1.6 build:
§1.7 playwright install:
§1.8 ops.spec.ts (PASS/FAIL + error summary):
§1.9 verify (@neardrop/web):
§2 manual: (summary / screenshots path if any)
```
