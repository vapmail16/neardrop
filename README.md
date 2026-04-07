# NearDrop (monorepo root)

This repository root is the Turborepo / npm workspace root (`package.json`, `turbo.json`, `frontend/`, `backend/`, `packages/`). Run all `npm` commands from here unless noted.

Neighbourhood last-mile delivery platform — monorepo per `docs/NEARDROP_MVP_IMPLEMENTATION_PLAN.md`.

## Structure

- `backend` — Fastify HTTP API (health + DB; **Phase 1:** JWT auth, users, refresh-token rotation, login rate limit).
- `frontend` — Next.js 14 App Router (portal route groups).
- `packages/shared` — Shared TypeScript types, Zod schemas, constants.
- `docs/` — Architecture, MVP plan, API notes, issue log, **[Phase 0 exit evidence](docs/evidence/phase-0-exit-gates.md)**, **[Phase 0 manual test checklist](docs/MANUAL_TEST_PHASE_0.md)**, **[Phase 4 carrier portal manual checklist](docs/MANUAL_TEST_PHASE_4.md)**, **[Phase 5 customer portal manual checklist](docs/MANUAL_TEST_PHASE_5.md)**.
- `database/` — Schema reference pointer ([see `database/README.md`](database/README.md)); migrations in `backend` are source of truth.
- `example_documents/` — Non-normative reference guides ([`example_documents/README.md`](example_documents/README.md)).
- `.github/workflows/` — GitHub Actions workflows.

## Prerequisites

- Node.js **20+**
- **PostgreSQL 16** recommended (matches CI; **14+** also supported — migrations use `EXECUTE FUNCTION` for triggers)
- Docker **not** required — use a local Postgres install (e.g. [Postgres.app](https://postgresapp.com), Homebrew `postgresql@16`, or your existing server)

## PostgreSQL 16 — create database (local)

Use a **superuser** session (password in URL or `psql` as an admin role), then:

```sql
CREATE ROLE neardrop LOGIN PASSWORD 'neardrop';
CREATE DATABASE neardrop OWNER neardrop;
-- connect to DB neardrop as superuser, then:
GRANT ALL ON SCHEMA public TO neardrop;
```

Set `DATABASE_URL` in `.env` (see `.env.example`; often port **5432** for a default install or another port if your cluster listens elsewhere).

If you see **`SASL: client password must be a string`**, include **both** `user` and `password` in `DATABASE_URL`.

### Phase 0 check (migrations + TDD integration)

Before closing Phase 0, run through **`docs/MANUAL_TEST_PHASE_0.md`** (hands-on sign-off).

```bash
npm run migrate
npm run migrate:rollback && npm run migrate
npm run test
npm run test:integration
```

**Local dev ports (defaults):** API **`3010`**, web **`3020`** — avoids clashes with other apps on 3000/3001. Override with `PORT` in `backend/.env` (API) only if needed; Next dev port is fixed in `frontend` `dev` script.

NearDrop health (start API first: `npm run dev --workspace=@neardrop/api`):

`curl -s http://127.0.0.1:3010/api/v1/health` → `success: true`, `data.database: "connected"`.

### Phase 1 — Auth (`/api/v1/auth`)

HTTP-only cookies: **`nd_access`** (short-lived JWT), **`nd_refresh`** (long-lived JWT, rotated on refresh). Clients may also send the access token as **`Authorization: Bearer <token>`** for API-style callers.

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `POST` | `/api/v1/auth/register` | Create user (all four `role` values allowed). **Affiliate** registrations require a valid UK `postcode`. Passwords must meet shared strength rules (see `packages/shared` password helper). |
| `POST` | `/api/v1/auth/login` | Returns user JSON + sets cookies. **Rate limit:** 5 requests / 15 minutes per route (brute-force mitigation). |
| `POST` | `/api/v1/auth/refresh` | Rotates refresh token and re-issues cookies. |
| `POST` | `/api/v1/auth/logout` | Revokes refresh tokens for the user; clears cookies. Requires auth. |
| `GET` | `/api/v1/auth/me` | Current profile. Requires auth. |
| `GET` | `/api/v1/auth/ops-ping` | **RBAC smoke:** `200` only if JWT role is **`ops`**; otherwise **`403`** (after auth). |

## Setup

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET (32+ characters)

npm install
npm run build
```

The API and Knex CLI **auto-load** the monorepo root `.env` (the directory that contains `turbo.json` — this folder), so you can run `npm run migrate` from here without exporting variables manually.

### Database migrations

```bash
npm run migrate
```

Rollback (dev only):

```bash
npm run migrate:rollback
```

## Commands

| Command | Description |
| ------- | ----------- |
| `npm run build` | Build all packages (Turbo) |
| `npm run typecheck` | TypeScript across workspaces |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (unit tests; **no live DB required**) |
| `npm run test:integration` | Schema/trigger checks against Postgres (**after migrate**) |
| `npm run migrate` | Knex migrate:latest (`backend`) |
| `npm run migrate:rollback` | Knex migrate:rollback |
| `npm run record:phase0-evidence` | Re-run Phase 0 exit gates and overwrite `docs/evidence/phase-0-exit-gates.md` |
| `npm run test:e2e:web` | Playwright E2E for `@neardrop/web` (Phase 4 carrier journey + smoke; needs Postgres + migrated DB) |
| `npm run dev` | Turbo dev (parallel) — run individual apps below if you prefer |

### TDD workflow (Phase 0)

1. **Unit**: `npm run test` — config, health mocks, shared Zod, Phase 0 evidence contract, etc. (no DB).
2. **Integrate DB**: run `npm run migrate`, then `npm run test:integration` — asserts tables + `updated_at` triggers exist (`RUN_DB_INTEGRATION=1` is set by the root script).

**Re-record Phase 0 gate evidence** (after changing gates or CI): `npm run record:phase0-evidence` — updates `docs/evidence/phase-0-exit-gates.md` and runs the full suite twice so the committed log stays consistent with `npm run test`.

### Run API locally

```bash
npm run dev --workspace=@neardrop/api
```

Health: `GET http://localhost:3010/api/v1/health` (expects **200** and `"database": "connected"` when DB is up).

### Run web locally

```bash
npm run dev --workspace=@neardrop/web
```

Open http://localhost:3020

Use `frontend/.env.local` for `NEXT_PUBLIC_*` (see `.env.example`).

### E2E (Playwright — Phase 4 gate)

Requires **PostgreSQL**, root `.env` with `DATABASE_URL`, and **`npm run migrate`**. Playwright starts API + web (or reuses servers on the same ports when `CI` is unset).

```bash
npx playwright install chromium
npm run test:e2e:web
```

The **carrier** spec exercises login, CSV manifest upload, parcels list, and **Mark in transit** (no env-based `test.skip`). Optional: `PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_API_ORIGIN` (see root `.env.example`).

## Phase 0 exit gates

With PostgreSQL running and root `.env` filled:

- `npm run typecheck` — 0 errors  
- `npm run lint` — 0 errors  
- `npm run test` — 0 failures  
- `npm run migrate` / `npm run migrate:rollback` / `npm run migrate` — succeed  
- `npm run test:integration` — passes after migrations  
- Health returns **200** with `database: "connected"` when the API and DB are up  

## License

Private / proprietary — see repository owner.
