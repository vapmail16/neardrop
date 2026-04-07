# DCDeploy environment variables — NearDrop API

**Purpose:** Copy-paste checklist for the backend service on DCDeploy.  
**Build:** DCDeploy builds the image from `backend/Dockerfile` (you do **not** need to run Docker on your laptop).

---

## Required (production)

Set these in DCDeploy → backend service → Environment variables.

```env
NODE_ENV=production
PORT=3010
HOST=0.0.0.0

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

JWT_SECRET=minimum-32-characters-required-use-a-long-random-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
JWT_QR_COLLECTION_EXPIRES=7d

BCRYPT_ROUNDS=12
LOG_LEVEL=info

# Browser origin for the deployed Next app (CORS). Update after frontend URL is known.
CORS_ORIGIN=https://your-frontend-host.example

# Keep 0 in production unless you understand the risk (disables login rate limit).
DISABLE_LOGIN_RATE_LIMIT=0
```

---

## Service settings (DCDeploy UI)

| Setting | Value |
| --------| ------|
| **Root / context** | Repository with `backend/` as the build context, or path `./backend` if the platform supports it |
| **Dockerfile path** | `backend/Dockerfile` (relative to repo root) |
| **Container port** | `3010` (must match `PORT`) |

---

## After deploy

```bash
curl -sS "https://YOUR-API-HOST/api/v1/health"
```

Expect JSON with `"success":true` and `"database":"connected"` when the database is reachable.

---

## Migrations

Run Knex **once** against the same `DATABASE_URL` (CI, a one-off job, or your machine with env set):

```bash
cd backend && npm run migrate
```

Do not bake migration runs into the image `CMD` unless you intentionally want that behaviour.

---

**Last updated:** 2026-04-07
