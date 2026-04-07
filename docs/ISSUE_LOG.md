# Issue log (NearDrop)

Log blockers and deviations discovered during implementation.  
Format: **date — title** — root cause — fix — prevention.

---

**2026-04-07 — API dev fails: `@neardrop/shared/dist/index.js` not found** — `@neardrop/shared` is consumed as built `dist/` output; fresh `npm install` does not compile it. — Ran `npm run build` in `backend/` (builds shared then API) before `npm run dev`. — **Prevention:** From `backend/`, run `npm run build` once before first API dev session; README calls this out.

**2026-04-07 — dcdeploy layout: no workspace root** — Deployment target expects only `frontend/`, `backend/`, and minimal repo root (`docs/`, `README.md`, `.gitignore`, plus `.github/` for Actions). — Removed root `package.json` / Turbo; moved `packages/shared` → `backend/packages/shared`, `database/` → `backend/database/`, `example_documents/` → `docs/example_documents/`, tooling into `backend/`; `dotenv`/`knexfile` resolve `.env` via `@neardrop/api` `package.json` instead of `turbo.json`. — **Prevention:** Run npm from `backend/` or `frontend/`; keep API env in `backend/.env`.

**2026-04-07 — Production DB URL shared in chat / assistant logs** — Passwords in URLs must be treated as compromised once pasted anywhere outside a secret store. — Rotate the dcdeploy database password and update `backend/.env` only on trusted machines; never commit `.env`. — **Prevention:** Use dcdeploy secret UI or env-injection for deploy; keep `DATABASE_URL` out of tickets, chat, and git.

**2026-04-07 — Assumption: Docker must be built locally before DCDeploy** — Unnecessary for this workflow. — DCDeploy runs `backend/Dockerfile` after `git push`; docs updated to state local `docker build` is optional. — **Prevention:** See `docs/BACKEND_DEPLOYMENT_GUIDE.md` and `docs/DEPLOYMENT_ISSUE_LOG.md`.

**2026-04-07 — Frontend DCDeploy parity with backend** — Needed Dockerfile, env checklist, deployment guide, and issue-log pattern aligned with **context `./frontend`**. — `frontend/Dockerfile` clones repo for `backend/packages/shared`, standalone runner uses **`node frontend/server.js`** and **`frontend/.next/static`**; `frontend/.dockerignore`, `frontend/DCDeploy_ENV_VARS.md`, `docs/FRONTEND_DEPLOYMENT_GUIDE.md`, Vitest contract on Dockerfile context paths. — **Prevention:** Read `docs/FRONTEND_DEPLOYMENT_GUIDE.md` before changing `file:` shared path, clone args, or `outputFileTracingRoot`.

**2026-04-07 — DCDeploy backend crash: `Invalid environment: JWT_SECRET: Required`** — The API validates env at startup (`backend/src/config/schema.ts`); `JWT_SECRET` was not injected on the backend service (or was empty), so Node exited before binding the port. — In DCDeploy → backend service → environment variables, set `JWT_SECRET` to a **random string of at least 32 characters** (see `backend/DCDeploy_ENV_VARS.md`). Ensure `DATABASE_URL`, `NODE_ENV=production`, and `CORS_ORIGIN` are set for real deploys. — **Prevention:** Use the checklist in `backend/DCDeploy_ENV_VARS.md` before first deploy; treat missing secrets as the first thing to verify when logs show `loadConfig` / `Invalid environment`.

