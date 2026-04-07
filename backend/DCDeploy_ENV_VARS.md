# DCDeploy environment variables — NearDrop API

**Build:** DCDeploy runs **`Dockerfile`** with the **`backend/`** folder as the build context (subdirectory of the repo — same idea as mahimapareek).

---

## DCDeploy service settings (backend)

| Setting | Value |
| --------| ------|
| **Repository** | `vapmail16/neardrop` (or yours) |
| **Branch** | `main` (or production branch) |
| **Root directory / subfolder / context** | **`backend`** |
| **Dockerfile** | **`Dockerfile`** (file inside `backend/`; not `backend/Dockerfile` from repo root unless your UI is repo-root–relative) |
| **HTTP / container port** | **`3010`** |

If your platform labels it “working directory” or “project root”, it must be the folder that contains **`package.json`** and this **`Dockerfile`**.

---

## Required runtime variables (must be set before the container stays up)

The API calls `loadConfig()` on startup. If these are missing, Node exits immediately, e.g.:

`Error: Invalid environment: JWT_SECRET: Required`

Set in **DCDeploy → your backend service → Environment variables** (or Secrets):

```env
NODE_ENV=production
PORT=3010
HOST=0.0.0.0

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

JWT_SECRET=minimum-32-characters-use-a-long-random-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
JWT_QR_COLLECTION_EXPIRES=7d

BCRYPT_ROUNDS=12
LOG_LEVEL=info

CORS_ORIGIN=https://your-frontend-host.example
DISABLE_LOGIN_RATE_LIMIT=0
```

Generate a secret (32+ bytes hex):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## After deploy

```bash
curl -sS "https://YOUR-API-HOST/api/v1/health"
```

Expect `"success":true` and `"database":"connected"` when Postgres is reachable.

---

## Migrations

The container does **not** run Knex on start. Apply schema separately:

```bash
cd backend && DATABASE_URL='…' npm run migrate
```

---

**Last updated:** 2026-04-07
