# Phase 0 — Manual testing checklist

Use this document to verify foundation work **by hand** before starting Phase 1. All commands assume your shell’s working directory is **`project_scaffolding/`** (the npm / Turborepo root).

**References**

- Exit criteria: `docs/NEARDROP_MVP_IMPLEMENTATION_PLAN.md` §9 Phase 0.
- Last automated gate log (optional cross-check): `docs/evidence/phase-0-exit-gates.md`.

**Tester & environment**

| Field | Value |
| ----- | ----- |
| Tester name | |
| Date | |
| OS | |
| Node.js version (`node -v`) | |
| PostgreSQL (version / port) | |
| Branch / commit | |

---

## 1. Preconditions

| # | Step | Pass |
| --- | --- | --- |
| 1.1 | Repository cloned; you understand the Git root may symlink `.github` and `.gitignore` into this folder (see parent `README.md`). | [x] |
| 1.2 | `cd project_scaffolding` | [x] |
| 1.3 | `cp .env.example .env` (if you do not already have `.env`) and set **`DATABASE_URL`** (with user + password) and **`JWT_SECRET`** (32+ characters). | [x] |
| 1.4 | PostgreSQL is running and reachable at the host/port in `DATABASE_URL`. | [x] |
| 1.5 | Database and role exist (see `README.md` SQL) or your URL points at an already-provisioned DB. | [x] |

---

## 2. Dependencies install

| # | Command | Expected | Pass |
| --- | --- | --- | --- |
| 2.1 | `npm ci` **or** `npm install` | Completes without errors. | [x] |

---

## 3. Static quality gates

| # | Command | Expected | Pass |
| --- | --- | --- | --- |
| 3.1 | `npm run lint` | Exit code **0**; no ESLint errors. | [x] |
| 3.2 | `npm run typecheck` | Exit code **0**; no TypeScript errors. | [x] |

---

## 4. Unit tests (no live DB required)

| # | Command | Expected | Pass |
| --- | --- | --- | --- |
| 4.1 | `npm run test` | Exit code **0**; all workspace Vitest suites pass. | [x] |

---

## 5. Database migrations

| # | Command | Expected | Pass |
| --- | --- | --- | --- |
| 5.1 | `npm run migrate` | Exit code **0**; migrations apply (`Already up to date` is OK if already migrated). | [x] |
| 5.2 | `npm run migrate:rollback` | Exit code **0**; last migration batch rolls back (**dev only**). | [x] |
| 5.3 | `npm run migrate` | Exit code **0**; migrations apply again (repeatability). | [x] |

**Notes**

- Never roll back production databases casually; this step is for **local/staging** verification per the plan.

---

## 6. Integration tests (live PostgreSQL)

| # | Command | Expected | Pass |
| --- | --- | --- | --- |
| 6.1 | `npm run test:integration` | Exit code **0**; full API DB suite passes (`RUN_DB_INTEGRATION=1` via root script): **12** tests including schema, health, auth, parcels, **affiliates**. | [x] |

---

## 7. Production build

| # | Command | Expected | Pass |
| --- | --- | --- | --- |
| 7.1 | `npm run build` | Exit code **0**; API and web build complete. | [x] |

---

## 8. API health (manual HTTP)

| # | Step | Expected | Pass |
| --- | --- | --- | --- |
| 8.1 | Terminal 1: `npm run dev --workspace=@neardrop/api` | Server starts on default **`3010`** (see `.env` `PORT`; avoids 3001). | [x] |
| 8.2 | Terminal 2: `curl -sS "http://127.0.0.1:3010/api/v1/health"` | HTTP **200**; JSON includes **`"success": true`** and **`"database": "connected"`** (or equivalent `data.database` shape used by your API). | [x] |
| 8.3 | If you changed `PORT`, substitute it in the URL; payload must be **NearDrop’s** health shape, not another service. | | [x] |

Stop the dev server when finished.

---

## 9. Web app smoke (optional)

| # | Step | Expected | Pass |
| --- | --- | --- | --- |
| 9.1 | `npm run dev --workspace=@neardrop/web` | Next.js dev server starts on **`3020`** (see `apps/web` `dev` script). | [x] |
| 9.2 | Open `http://localhost:3020` in a browser | Page loads; no hard crash. Phase 0 does not require full portal QA. | [x] |

---

## 10. Playwright E2E (optional)

| # | Step | Expected | Pass |
| --- | --- | --- | --- |
| 10.1 | Install browsers if needed: `npx playwright install` (from `apps/web` or repo as documented). | | [x] |
| 10.2 | With web (and API if the spec needs it) running, `npm run test:e2e --workspace=@neardrop/web` | Per project config; smoke spec passes if enabled. | [x] |

---

## 11. Documentation & repo hygiene

| # | Step | Expected | Pass |
| --- | --- | --- | --- |
| 11.1 | Open `.env.example` | Lists required vars (`DATABASE_URL`, `JWT_SECRET`, API + web hints). | [x] |
| 11.2 | Skim `README.md` in this folder | Setup, migrate, health, and `test:integration` are described. | [x] |
| 11.3 | (Optional) `npm run record:phase0-evidence` | Regenerates `docs/evidence/phase-0-exit-gates.md` if you changed gates or want a fresh log. | [x] |

---

## 12. Phase 0 sign-off

| # | Question | Pass |
| --- | --- | --- |
| 12.1 | All **required** rows above (sections 1–8, 11) completed with no blocking failures? | [x] |
| 12.2 | Ready to **freeze** Phase 0 and begin Phase 1 only after this checklist is green? | [x] |

**Sign-off**

- Tester: Automated verification (IDE agent) — **you** may re-sign when satisfied  
- Date: 2026-04-04 (evidence: `npm run record:phase0-evidence` → `docs/evidence/phase-0-exit-gates.md`)  

---

## Out of scope for Phase 0

Do **not** treat the following as Phase 0 blockers (they belong to later phases):

- User registration / login / JWT
- Role-based routes beyond health
- Parcel workflows, QR, email, full portal E2E

When Phase 0 is green, proceed to **Phase 1 — Auth + User Service** only after your explicit go-ahead.
