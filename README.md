# NearDrop

Neighbourhood last-mile delivery platform. The repo is laid out for deployment tools that expect a **minimal root** (`docs/`, this file, `.gitignore`, `.github/`) and two application trees: **`backend/`** and **`frontend/`**, each with its own `package.json` and lockfile.

Plan and process: `docs/NEARDROP_MVP_IMPLEMENTATION_PLAN.md`.

## Structure

- `backend/` — Fastify API, Knex migrations, and **`backend/packages/shared`** (TypeScript types, Zod schemas, constants) linked as `@neardrop/shared`.
- `frontend/` — Next.js 14 App Router (portal route groups).
- `docs/` — Architecture, MVP plan, API notes, issue log, **[Phase 0 exit evidence](docs/evidence/phase-0-exit-gates.md)**, manual test checklists, and **[example reference material](docs/example_documents/README.md)** (non-normative).
- `backend/database/` — Schema reference snapshot; **migrations** live under `backend/src/database/migrations/`.
- `.github/workflows/` — CI (must stay at repository root for GitHub Actions).

**DCDeploy:** Images build **on DCDeploy** (no local Docker required).  
- **API:** Context subdirectory **`backend/`**, Dockerfile **`Dockerfile`** inside it (mahimapareek-style). Set **`JWT_SECRET`** + **`DATABASE_URL`** in the service env or the container exits on boot — see **`docs/BACKEND_DEPLOYMENT_GUIDE.md`**, **`backend/DCDeploy_ENV_VARS.md`**.  
- **Web:** Context **`./frontend`**, Dockerfile **`./Dockerfile`** (Dockerfile clones the repo for `backend/packages/shared`); container port **`3000`** by default — see **`docs/FRONTEND_DEPLOYMENT_GUIDE.md`**, **`frontend/DCDeploy_ENV_VARS.md`**.  
- **Checklist:** **`docs/DEPLOYMENT_CHECKLIST.md`**.

Run **`npm install` and all `npm run …` commands from `backend/` or `frontend/`** as documented below (not from the repo root).

## Prerequisites

- Node.js **20+**
- **PostgreSQL** — **16** recommended (matches CI; **14+** supported). Ensure the server is **running** on the host/port in `DATABASE_URL` (often **`127.0.0.1:5432`**).

## PostgreSQL — create role and database (local)

```bash
psql -h 127.0.0.1 -p 5432 -U postgres -d postgres
```

```sql
CREATE ROLE neardrop LOGIN PASSWORD 'neardrop';
CREATE DATABASE neardrop OWNER neardrop;
\c neardrop
GRANT ALL ON SCHEMA public TO neardrop;
```

Copy **`backend/.env.example`** → **`backend/.env`** and set at least:

`DATABASE_URL=postgresql://neardrop:neardrop@127.0.0.1:5432/neardrop`  
`JWT_SECRET=` (32+ characters)

Use **`frontend/.env`** or **`frontend/.env.local`** for Next (`API_UPSTREAM`, optional `NEXT_PUBLIC_*`); see **`frontend/.env.example`**. Both names are gitignored.

### Phase 0 check (migrations + TDD integration)

See **`docs/MANUAL_TEST_PHASE_0.md`**.

```bash
cd backend
npm install
npm run migrate
npm run migrate:rollback && npm run migrate
npm run test
npm run test:integration
```

**Ports:** API **`3010`**, web **`3020`**.

Health (with API running):

`curl -s http://127.0.0.1:3010/api/v1/health` → `success: true`, `data.database: "connected"`.

### Phase 1 — Auth (`/api/v1/auth`)

HTTP-only cookies: **`nd_access`**, **`nd_refresh`**. Bearer tokens supported for API-style callers.

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `POST` | `/api/v1/auth/register` | Create user (all four `role` values). **Affiliate** needs valid UK `postcode`. Password rules live in **`@neardrop/shared`**. |
| `POST` | `/api/v1/auth/login` | Sets cookies; rate limited. |
| `POST` | `/api/v1/auth/refresh` | Rotates refresh token. |
| `POST` | `/api/v1/auth/logout` | Revokes refresh tokens. |
| `GET` | `/api/v1/auth/me` | Current profile. |
| `GET` | `/api/v1/auth/ops-ping` | **RBAC:** `200` only for **`ops`**. |

## Setup

```bash
cd backend
cp .env.example .env
# Edit .env — DATABASE_URL, JWT_SECRET (32+)

npm install
npm run build
```

The API and Knex CLI load **`backend/.env`** via `loadMonorepoDotenv` (walks up to the **`@neardrop/api`** `package.json`), so `npm run migrate` from **`backend/`** works without exporting variables manually.

```bash
cd frontend
npm install
```

### Database migrations (from `backend/`)

```bash
npm run migrate
npm run migrate:rollback   # dev only
```

## Commands

### Backend (`cd backend`)

| Command | Description |
| ------- | ----------- |
| `npm run build` | Build `@neardrop/shared` then compile API |
| `npm run dev` | API dev server (tsx watch) |
| `npm run start` | Run compiled `dist/server.js` |
| `npm run typecheck` | Shared + API TypeScript |
| `npm run lint` | Shared + API ESLint |
| `npm run test` | Shared + API Vitest (no DB for unit tests) |
| `npm run test:integration` | DB integration tests (**after migrate**; sets `RUN_DB_INTEGRATION=1`) |
| `npm run migrate` / `npm run migrate:rollback` | Knex |
| `npm run seed:demo` | Demo seed |
| `npm run record:phase0-evidence` | Refresh `docs/evidence/phase-0-exit-gates.md` |
| `npm run test:phase8-count-gate` | Vitest count gate (backend + frontend totals) |
| `npm run verify-env` | Check required env vars |

### Frontend (`cd frontend`)

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Next.js on **3020** |
| `npm run build` | Production build |
| `npm run lint` / `npm run typecheck` / `npm run test` | Quality gates |
| `npm run test:e2e` | Playwright (starts API + web via config unless reuse is enabled) |
| `npm run verify` | lint → typecheck → test → build |

### TDD / Phase 0 evidence

1. **Unit:** `cd backend && npm run test` and `cd frontend && npm run test`.
2. **DB:** `cd backend && npm run migrate` then `npm run test:integration`.

Re-record Phase 0 evidence: **`cd backend && npm run record:phase0-evidence`**.

### E2E (Playwright)

Requires Postgres, **`backend/.env`**, and **`cd backend && npm run migrate`**.

```bash
cd frontend
npx playwright install chromium
npm run test:e2e
```

## Phase 0 exit gates

With PostgreSQL and **`backend/.env`**:

- `cd backend && npm run typecheck` — 0 errors  
- `cd frontend && npm run typecheck` — 0 errors  
- Same for `lint`, `test` in both folders  
- `cd backend && npm run migrate` / rollback / migrate — succeed  
- `cd backend && npm run test:integration` — passes  

## License

Private / proprietary — see repository owner.
