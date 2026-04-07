# Phase 8 — Manual testing guide (end-to-end polish & launch readiness)

Use after **Phases 0–7** are green. Working directory: **`project_scaffolding/`** (monorepo root for npm scripts).

**References**

- Plan: `docs/NEARDROP_MVP_IMPLEMENTATION_PLAN.md` §9 **Phase 8** (golden + exception E2E, demo seed, UI polish, security, deployment).
- Automated full gate: `npm run verify:all` (typecheck → lint → test → migrate → rollback → migrate → integration → build → **Vitest ≥200** → Playwright E2E).
- Phase 8 Vitest floor: `npm run test:phase8-count-gate` → parses `turbo run test --force` output; fails if total passed tests &lt; **200**.
- Golden path E2E: `apps/web/src/__tests__/e2e/phase8-golden-lifecycle.spec.ts` + `phase8-golden-seed.ts`.
- Exception / ops recovery E2E: `phase8-exception-flow.spec.ts` + `phase8-exception-seed.ts`.
- Demo seed: `apps/api/src/scripts/run-demo-seed.ts`, `npm run seed:demo`.
- Ops dashboard skeleton: `PageSkeleton` in `OpsDashboardClient.tsx`; root error UI: `apps/web/src/app/error.tsx`.

**Tester & environment**

| Field | Value |
| ----- | ----- |
| Tester name | *(fill)* |
| Date | *(fill)* |
| Node.js (`node -v`) | *(e.g. v20.x)* |
| PostgreSQL | Required: `DATABASE_URL` in `.env` at or above `project_scaffolding/` |
| Playwright | `cd apps/web && npx playwright install chromium` (first machine or CI) |
| Branch / commit (`git rev-parse HEAD`) | *(fill)* |

**URLs (defaults)**

- Web: `http://127.0.0.1:3020` (`PLAYWRIGHT_BASE_URL`)
- API: `http://127.0.0.1:3010` (`PLAYWRIGHT_API_ORIGIN`)

**Port hygiene**

- If E2E reports “url already used”, free **3010** and **3020** (stale `dev` / Playwright `webServer`), or set `PLAYWRIGHT_FORCE_NEW_SERVER=1` only when you intend Playwright to spawn a **new** stack (ports must be free).

---

## 1. Automated gates (required — matches `verify:all`)

Run in order, or a single pass:

```bash
npm run verify:all
```

| # | Step | Command (if run individually) | Expected | Pass |
| --- | --- | --- | --- | --- |
| 1.1 | TypeScript | `npm run typecheck` | All packages **0** errors | [ ] |
| 1.2 | ESLint | `npm run lint` | **0** errors | [ ] |
| 1.3 | Unit tests | `npm run test` | All Vitest tasks pass (shared + api + web) | [ ] |
| 1.4 | Migrate | `npm run migrate` | Success (`Already up to date` OK) | [ ] |
| 1.5 | Rollback + re-migrate | `npm run migrate:rollback` then `npm run migrate` | Proves migrations repeatable | [ ] |
| 1.6 | Integration | `npm run test:integration` | API DB integration suites pass (`REQUIRES DATABASE_URL`) | [ ] |
| 1.7 | Production build | `npm run build` | Turbo build **0** | [ ] |
| 1.8 | Phase 8 test count | `npm run test:phase8-count-gate` | **≥ 200** Vitest tests passed (monorepo total) | [ ] |
| 1.9 | E2E | `npm run test:e2e:web` | All Playwright specs pass (see §2) | [ ] |

**Notes**

- `verify:all` does **not** repeat a second generic `npm run test` after E2E; the **200+** check is **`test:phase8-count-gate`** after build.
- E2E starts API + web via `playwright.config.mjs` unless an existing server is reused (see `reuseExistingServer` / `PLAYWRIGHT_FORCE_NEW_SERVER`).

---

## 2. Playwright E2E catalog (`apps/web/src/__tests__/e2e/*.spec.ts`)

| Spec | What it validates |
| ---- | ----------------- |
| `00-smoke.spec.ts` | `/` and `/login` load (warm-up for Next dev) |
| `carrier.spec.ts` | Carrier portal: manifest, parcels, in transit |
| `customer.spec.ts` | Customer portal: parcels, QR, affiliate map on detail |
| `affiliate.spec.ts` | Affiliate portal: parcels, scan handover, earnings |
| `ops.spec.ts` | Ops: stats, map, parcels, manual reassignment |
| `phase4-manual-checklist.spec.ts` | Phase 4 parity: home links, registration, carrier flow, sign-out, wrong role |
| `phase8-golden-lifecycle.spec.ts` | Full happy path: affiliate sees parcel, collects with QR, earnings update |
| `phase8-exception-flow.spec.ts` | Exception badge → ops recovery PATCH → `ready_to_collect` in UI |
| `phase8-manual-parity.spec.ts` | §4 login shells (four portals) + §5 live API health security headers |

**Run a single spec (debug)**

```bash
npm run test:e2e --workspace=@neardrop/web -- src/__tests__/e2e/phase8-golden-lifecycle.spec.ts
```

| # | Case | Pass |
| --- | --- | --- |
| 2.1 | Full suite: `npm run test:e2e:web` | [ ] |
| 2.2 | (Optional) Re-run only Phase 8 specs | [ ] |

---

## 3. Demo seed (optional — disposable DB)

| # | Step | Pass |
| --- | --- | --- |
| 3.1 | Use fresh or disposable DB (seed is not idempotent; unique emails/tags). | [ ] |
| 3.2 | `npm run migrate` | [ ] |
| 3.3 | `npm run seed:demo` (optional: `DEMO_SEED_PARCEL_COUNT=48 DEMO_SEED_TAG=tag npm run seed:demo`) | [ ] |
| 3.4 | JSON summary: `parcelIds.length` matches `parcelCount`; `matchedAffiliate` &gt; 0 | [ ] |
| 3.5 | Production: without `ALLOW_PRODUCTION_DEMO_SEED=1`, script refuses | [ ] |

---

## 4. Manual UI smoke (four portals)

Perform in a browser with **API + web** running (`npm run dev` from `project_scaffolding/` or separate terminals).

| # | Portal | Action | Expected | Pass |
| --- | --- | --- | --- | --- |
| 4.1 | Ops | Open **Operations dashboard** | Brief **skeleton**, then stats (not stuck loading) | [ ] |
| 4.2 | Ops | Open **Parcels** | List loads; filters / rows usable | [ ] |
| 4.3 | Carrier | Dashboard + manifests + parcels | No blank shell | [ ] |
| 4.4 | Customer | Parcels list + one parcel detail | QR / map sections as applicable | [ ] |
| 4.5 | Affiliate | Parcels + scan + earnings | No permanent blank screen | [ ] |
| 4.6 | (Optional) | Trigger recoverable client error | Root **error.tsx**: “Something went wrong” + **Try again** works | [ ] |

---

## 5. Security sanity (API / headers)

| # | Check | Pass |
| --- | --- | --- |
| 5.1 | `GET http://127.0.0.1:3010/api/v1/health` **or** via rewrite `GET http://127.0.0.1:3020/api/v1/health` | **200**, JSON `success: true` when DB up | [ ] |
| 5.2 | Response headers include **`x-content-type-options: nosniff`** | [ ] |
| 5.3 | Frame policy present (**`x-frame-options`** and/or CSP **`frame-ancestors`**) | [ ] |
| 5.4 | (Staging/prod) HTTPS, auth rate limits, external scanner (e.g. securityheaders.com) per org policy | [ ] |

**Automated parity:** `apps/api/src/routes/health.test.ts` asserts Helmet baseline on `/api/v1/health`.

---

## 6. Phase 8 plan exit criteria (tracking)

Check off as your org completes them (some require **deployed** environments).

| Criterion | Local / CI | Prod |
| --------- | ---------- | --- |
| Full Vitest green + **200+** tests | `verify:all` | Same discipline on release branch |
| TypeScript / ESLint zero errors | `verify:all` | CI |
| Golden path E2E | `test:e2e:web` | Manual on deployed URL |
| Exception path E2E | `test:e2e:web` | Manual on deployed URL |
| Demo seed impressive for demos | §3 | Staging |
| Four portals usable | §4 | Prod smoke |
| No critical console errors | §4 | Browser devtools |
| Deployment (API host + Vercel/web) | — | Runbook |
| HTTPS + security headers audit | §5 | §5 |

---

## 7. Sign-off

| Field | Value |
| ----- | ----- |
| Date | *(human / release)* |
| Commit SHA | *(human / release)* |
| `verify:all` | *(PASS / FAIL)* |
| E2E | *(PASS / FAIL; flaky notes)* |
| Demo seed §3 | *(skipped OK for app-only validation)* |
| Manual UI §4–§5 | *(requires human browser)* |
| Skipped items (reason) | |

---

## 8. Automated run log (update)

**§3 Demo seed (automatable):** `DEMO_SEED_PARCEL_COUNT=6 DEMO_SEED_TAG=phase8manual npm run seed:demo` — JSON showed **6** `parcelIds`, `matchedAffiliate` **4** (&gt; 0).

**Remaining Phase 8 cases automated in code**

- §**3.5** production refusal: Vitest `apps/api/src/scripts/run-demo-seed.production-guard.contract.test.ts`.
- §**4** login shells + §**5** live health headers: Playwright `phase8-manual-parity.spec.ts`.

**Latest full gate snapshot** (run `npm run verify:all` locally for your machine; ports **3010** / **3020** free; Postgres + `DATABASE_URL`).

| Step | Result | Notes |
| ---- | ------ | ----- |
| `npm run lint` | PASS | (recent agent run) |
| `npm run test` (--force) | PASS | shared **34**, api **67**, web **157** passed (+ skips) → total passed **258** |
| `npm run test:e2e:web` | PASS | **19** tests, **0** flaky (`phase8-manual-parity` + hardened `affiliate` + retrying `phase8-exception-seed`) |

**Playwright specs:** `00-smoke`, `carrier`, `customer`, `affiliate`, `ops`, `phase4-manual-checklist` (6), `phase8-exception-flow`, `phase8-golden-lifecycle`, `phase8-manual-parity` (5).

**Still human-only:** §**4** full authenticated portal walkthrough, §**5.4** prod HTTPS / external scanners, §**6** production deploy smoke.
