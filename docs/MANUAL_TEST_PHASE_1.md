# Phase 1 — Manual testing checklist (Auth + User Service)

Use after **Phase 0** is green. Working directory: **`project_scaffolding/`**.

**References**

- Plan: `docs/NEARDROP_MVP_IMPLEMENTATION_PLAN.md` §9 Phase 1.
- API behaviour: `README.md` (Phase 1 — Auth).
- Automated DB tests: `npm run test:integration` (includes auth flow + **ops-ping** 403/200).

**Tester & environment**

| Field | Value |
| ----- | ----- |
| Tester name | Automated verification (IDE agent) — replace with human name if required |
| Date | 2026-04-04 (UTC) |
| Branch / commit | `02ac5ee` (short SHA at run time; re-check with `git rev-parse HEAD`) |

---

## 1. Automated gates (run first)

| # | Command | Expected | Pass |
| --- | --- | --- | --- |
| 1.1 | `npm run migrate` | Success (`Already up to date` OK). | [x] |
| 1.2 | `npm run test` | All workspace Vitest suites pass. | [x] |
| 1.3 | `npm run test:integration` | Exit **0**; **12** tests across **7** files (schema, user repo, auth flow ×3, health DB, parcel Phase 2 & 3, **affiliates**) with `DATABASE_URL`. | [x] |
| 1.4 | `npm run lint` && `npm run typecheck` && `npm run build` | All exit **0**. | [x] |

---

## 2. API manual smoke (Terminal A: API dev)

Start API: `npm run dev --workspace=@neardrop/api` (default **3010**).

**Scripted smoke (recommended — runs every §2 row without skipping)**

```bash
bash scripts/manual-test-phase1-smoke.sh
```

**Hand curl** — use a **strong** password (same rules as `registerRequestSchema`, e.g. `GoodPassw0rd!`) and a **valid UK postcode** for `customer` (e.g. `SW1A 1AA`). Replace `EMAIL` with a fresh test address.

| # | Step | Expected | Pass |
| --- | --- | --- | --- |
| 2.1 | `curl -sS -c /tmp/nd-cookies.txt -H 'Content-Type: application/json' -d '{"email":"EMAIL","password":"GoodPassw0rd!","firstName":"T","lastName":"U","role":"customer","postcode":"SW1A 1AA"}' http://127.0.0.1:3010/api/v1/auth/register` | HTTP **200**; `success: true`; `Set-Cookie` includes session cookies. | [x] |
| 2.2 | `curl -sS -b /tmp/nd-cookies.txt http://127.0.0.1:3010/api/v1/auth/me` | HTTP **200**; `data.user.email` matches. | [x] |
| 2.3 | `curl -sS -b /tmp/nd-cookies.txt -o /dev/null -w '%{http_code}' http://127.0.0.1:3010/api/v1/auth/ops-ping` | HTTP **403** (non-ops JWT). | [x] |
| 2.4 | `curl -sS -b /tmp/nd-cookies.txt -X POST http://127.0.0.1:3010/api/v1/auth/refresh` | HTTP **200**; new `Set-Cookie` headers. | [x] |
| 2.5 | `curl -sS -b /tmp/nd-cookies.txt -X POST http://127.0.0.1:3010/api/v1/auth/logout` | HTTP **200**; cookies cleared. | [x] |

**Ops positive path (separate user)**

| # | Step | Expected | Pass |
| --- | --- | --- | --- |
| 2.6 | Register with `"role":"ops"` (new email), save cookies to e.g. `/tmp/nd-ops.txt`, then `curl -sS -b /tmp/nd-ops.txt -o /dev/null -w '%{http_code}' http://127.0.0.1:3010/api/v1/auth/ops-ping` | HTTP **200**. | [x] |

**Evidence (automated curl run, same steps as above)**

- API dev server on **3010**; customer email pattern `manual-p1-cust-<unix>@example.com`, ops email `manual-p1-ops-<unix>@example.com`; password `GoodPassw0rd!`; customer registration includes a valid UK **postcode** (script generates a hub-shaped code per run).
- Observed status codes: register **200**, **me** **200** (body contained email), **ops-ping** **403** (customer), refresh **200**, logout **200**; ops register **200**, **ops-ping** **200**.
- Node at gate run: **v20.20.0**. API log for this run (if needed): `/tmp/nd-api-p1-manual.log`.

---

## 3. Phase 1 sign-off

| # | Question | Pass |
| --- | --- | --- |
| 3.1 | All rows in §1–§2 completed with no blocking failures? | [x] |
| 3.2 | Ready to **freeze** Phase 1 and plan Phase 2 only after explicit go-ahead? | [x] |

**Sign-off**

- Tester: Automated verification (IDE agent) — **you** may re-sign below when satisfied  
- Date: 2026-04-04  

**Note:** §3.2 may be ticked after scripted smoke + gates are green; re-open if process requires a named human sign-off.

---

## Out of scope for Phase 1

Parcel workflows, QR, carrier manifests, Next.js login UI wired to cookies (can follow in a later slice). Phase 1 **backend** auth is complete when this checklist and automated gates are green.
