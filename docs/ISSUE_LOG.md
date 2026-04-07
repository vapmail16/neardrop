# Issue log (NearDrop)

Log blockers and deviations discovered during implementation.  
Format: **date — title** — root cause — fix — prevention.

---

**2026-04-07 — API dev fails: `@neardrop/shared/dist/index.js` not found** — `@neardrop/shared` is consumed as built `dist/` output; fresh `npm install` does not compile it. — Ran `npm run build` in `backend/` (builds shared then API) before `npm run dev`. — **Prevention:** From `backend/`, run `npm run build` once before first API dev session; README calls this out.

**2026-04-07 — dcdeploy layout: no workspace root** — Deployment target expects only `frontend/`, `backend/`, and minimal repo root (`docs/`, `README.md`, `.gitignore`, plus `.github/` for Actions). — Removed root `package.json` / Turbo; moved `packages/shared` → `backend/packages/shared`, `database/` → `backend/database/`, `example_documents/` → `docs/example_documents/`, tooling into `backend/`; `dotenv`/`knexfile` resolve `.env` via `@neardrop/api` `package.json` instead of `turbo.json`. — **Prevention:** Run npm from `backend/` or `frontend/`; keep API env in `backend/.env`.

**2026-04-07 — Production DB URL shared in chat / assistant logs** — Passwords in URLs must be treated as compromised once pasted anywhere outside a secret store. — Rotate the dcdeploy database password and update `backend/.env` only on trusted machines; never commit `.env`. — **Prevention:** Use dcdeploy secret UI or env-injection for deploy; keep `DATABASE_URL` out of tickets, chat, and git.

**2026-04-07 — Assumption: Docker must be built locally before DCDeploy** — Unnecessary for this workflow. — DCDeploy runs `backend/Dockerfile` after `git push`; docs updated to state local `docker build` is optional. — **Prevention:** See `docs/BACKEND_DEPLOYMENT_GUIDE.md` and `docs/DEPLOYMENT_ISSUE_LOG.md`.

