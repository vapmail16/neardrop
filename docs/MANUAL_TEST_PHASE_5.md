# Phase 5 — Manual testing checklist (Customer portal)

Use after **Phases 0–4** are green. Working directory: **`project_scaffolding/`**.

**References**

- Plan: `docs/NEARDROP_MVP_IMPLEMENTATION_PLAN.md` §9 Phase 5 (Customer Portal Frontend).
- Web: Next.js — `/customer/register` (public), `/customer/*` (protected), `/login?portal=customer`.
- Automated: `@neardrop/web` Vitest (**85** tests including customer API, hooks, components, integration).
- E2E: `npm run test:e2e:web` includes **`customer.spec.ts`** (seeded journey: login → parcels → QR + map).

**Tester & environment**

| Field | Value |
| ----- | ----- |
| Tester name | Automated verification (IDE agent) — re-sign with a human name if required |
| Date | 2026-04-02 |
| Node.js | v20.20.0 |
| Branch / commit | `02ac5ee25c0aeccf9582b7bcebba049b27332c63` |

---

## 1. Automated gates (run first)

| # | Command | Expected | Pass |
| --- | --- | --- | --- |
| 1.1 | `npm run migrate` | Success (`Already up to date` OK). | [x] |
| 1.2 | `npm run test` | All workspace Vitest suites pass. Web includes customer coverage. | [x] |
| 1.3 | `npm run test:integration` | Exit **0** with `DATABASE_URL`; **12** tests, **7** API files (set `RUN_DB_INTEGRATION=1` via root script). | [x] |
| 1.4 | `npm run lint` | Exit **0**. | [x] |
| 1.5 | `npm run typecheck` | Exit **0**. | [x] |
| 1.6 | `npm run build` | Exit **0**. | [x] |
| 1.7 | `npx playwright install chromium` | Browsers available. | [x] |
| 1.8 | `npm run test:e2e:web` | Exit **0**; **10** tests (smoke, carrier, customer, phase4 checklist). | [x] |
| 1.9 | `npm run verify:all` | Optional full pipeline (same as Phase 4 §1.9). Exit **0**. | [x] |

**Troubleshooting 1.8:** Same as Phase 4 — free **3010/3020**, or start API + web manually, then re-run E2E. Customer seed runs in `test.beforeAll` and needs a live API + Postgres.

---

## 2. Browser manual checks (Customer UX)

**Automation:** Home customer links (**2.1**) are asserted in `phase4-manual-checklist.spec.ts` §2.1 (Customer dashboard link). **2.3** — successful customer login in `customer.spec.ts`; carrier-on-customer-portal error in `LoginForm.test.tsx` (`blocks carrier role on customer portal`). **2.5** — parcels list shell and **2.6** — detail QR + map in `customer.spec.ts`. **2.2**, **2.4**, **2.5** (status filter + ~30s polling), and **2.7** are not covered end-to-end in Playwright — tick those after a manual pass or when E2E is extended.

| # | Step | Expected | Pass |
| --- | --- | --- | --- |
| 2.1 | Home — links to customer register / sign-in / dashboard | Links work. | [x] |
| 2.2 | `/customer/register` — strong password + UK postcode | Redirects to `/customer/dashboard`; matched hub or empty state. | [ ] |
| 2.3 | `/login?portal=customer` — sign in | Dashboard loads; carrier account shows error. | [x] |
| 2.4 | `/customer/dashboard` unauthenticated | Redirect to login with `portal=customer` + `returnTo`. | [ ] |
| 2.5 | **Parcels** list | Parcels for your account; filter works; ~30s refresh in dev tools (polling). | [ ] |
| 2.6 | Parcel **ready to collect** — open detail | QR block visible; affiliate map / OSM link. | [x] |
| 2.7 | **Sign out** | Returns to customer login; protected routes redirect again. | [ ] |

---

## 3. Phase 5 sign-off

| # | Question | Pass |
| --- | --- | --- |
| 3.1 | All §1 completed (including E2E when environment allows)? | [x] |
| 3.2 | §2 spot-checks OK? | [ ] |
| 3.3 | Ready for Phase 6 (Affiliate portal)? | [ ] |

**Sign-off:** Tester: Automated verification (IDE agent) — **§2 incomplete** until rows **2.2, 2.4, 2.5, 2.7** are checked manually or via new E2E. Date: 2026-04-02

---

## Out of scope (this checklist)

Native PWA install prompts, push notifications in browser, live email inbox verification, production map tiles beyond OSM embed/link.
