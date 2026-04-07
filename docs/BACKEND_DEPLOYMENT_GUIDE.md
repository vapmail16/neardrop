# Backend deployment guide — NearDrop (DCDeploy)

**Platform:** DCDeploy (Docker build runs **on DCDeploy**, not on your laptop).  
**Code:** `backend/` (Fastify + Knex + `@neardrop/shared`).

---

## Overview

1. DCDeploy clones the repo and builds the image using **`backend/Dockerfile`**.
2. You configure **environment variables** in the DCDeploy UI (see `backend/DCDeploy_ENV_VARS.md`).
3. You expose port **3010** and point the health check at **`GET /api/v1/health`** (or rely on the Dockerfile `HEALTHCHECK`).
4. You run **database migrations** against production Postgres when the schema changes (separate from the container start command).

**Local Docker build:** Optional troubleshooting only. Normal workflow is: push to Git → DCDeploy build → deploy.

---

## Prerequisites

- [ ] Remote PostgreSQL reachable from DCDeploy (managed DB or TCP proxy).
- [ ] `DATABASE_URL` tested from a machine that can reach the DB (e.g. `cd backend && DATABASE_URL=... npm run migrate`).
- [ ] `JWT_SECRET` is 32+ random characters (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
- [ ] `CORS_ORIGIN` matches the **browser URL** of the deployed Next app (scheme + host, no trailing path).

---

## DCDeploy: create the backend service

1. **New service** → Web / Docker (per DCDeploy product flow).
2. **Repository:** NearDrop GitHub repo, branch `main` (or your release branch).
3. **Build context:** Directory **`backend`** (so the Dockerfile sees `package.json` at context root), **or** set Dockerfile path to `backend/Dockerfile` and context to repo root per DCDeploy’s rules.
4. **Dockerfile:** `Dockerfile` if context is `backend/`; otherwise `backend/Dockerfile`.
5. **Port:** **3010** (internal container port; map to HTTPS in the platform as documented by DCDeploy).
6. **Environment:** Paste variables from `backend/DCDeploy_ENV_VARS.md` (no secrets in git — set only in the UI).

---

## Migrations (production)

The API container **does not** run `knex migrate` on startup by default.

When you change migrations:

```bash
cd backend
export DATABASE_URL='postgresql://...production...'
npm run migrate
```

Use a secure channel (CI job with secrets, or trusted admin machine). Record any deployment-specific problems in `docs/DEPLOYMENT_ISSUE_LOG.md`.

---

## Verify

```bash
curl -sS "https://YOUR-API-HOST/api/v1/health"
```

- **200** + `"success":true`, `"database":"connected"` → API and DB OK.
- **503** → API up but DB check failed (credentials, network, SSL, or firewall).

---

## Related docs

| File | Purpose |
|------|---------|
| `backend/Dockerfile` | Image build (executed on DCDeploy) |
| `backend/DCDeploy_ENV_VARS.md` | Env var checklist |
| `docs/DEPLOYMENT_CHECKLIST.md` | Short checklist |
| `docs/DEPLOYMENT_ISSUE_LOG.md` | Deployment issues and fixes |
| `docs/ISSUE_LOG.md` | General project issue log |

---

**Last updated:** 2026-04-07
