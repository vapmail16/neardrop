# Frontend deployment guide — NearDrop (DCDeploy)

**Stack:** Next.js 14 App Router, **`output: 'standalone'`** + **`experimental.outputFileTracingRoot`** (monorepo parent) for Docker.  
**Platform:** DCDeploy builds from **`frontend/Dockerfile`** with context **`./frontend`**.

---

## Build context: `./frontend`

DCDeploy is configured like the backend: **context** = **`./frontend`**, **Dockerfile** = **`./Dockerfile`**.

`@neardrop/web` still depends on **`file:../backend/packages/shared`**. The tarball for `./frontend` does **not** include `../backend`, so the Dockerfile **clones the same Git repository** during build and copies `backend/packages/shared` into the image before `npm ci` / `npm run build`.

**Build args:** `GIT_REPO`, `GIT_REF` (defaults target this repo’s `main`); `API_UPSTREAM` for production API URL. See `frontend/DCDeploy_ENV_VARS.md`.

---

## Build-time: `API_UPSTREAM`

Rewrites in `next.config.mjs` use `process.env.API_UPSTREAM` during **`next build`**.

Set a **Docker build argument** in DCDeploy:

```text
API_UPSTREAM=https://YOUR-API-HOST
```

- No trailing slash.
- Use `https` in production.
- Changing this value requires a **new frontend image build**.

---

## Image layout

1. **`shared-fetch`:** `git clone` + copy `backend/packages/shared` → `/app/backend/packages/shared`.
2. **`builder`:** `npm ci` and `npm run build` in `/app/frontend`.
3. **`runner`:** Copy `.next/standalone` to `/app`, copy static files to **`frontend/.next/static`** (standalone server path is **`frontend/server.js`**), run **`node frontend/server.js`** on **`PORT`** (default **3000**).

**`.dockerignore`** in `frontend/` trims the build context.

---

## Port

Use **container port 3000** and **`PORT=3000`** unless your platform injects `PORT`. The process runs as a non-root user; binding to port 80 inside the container is not the default.

---

## CORS

After the frontend has a public URL, set the API’s **`CORS_ORIGIN`** to that URL and redeploy the **backend** (`backend/DCDeploy_ENV_VARS.md`).

---

## Verify

- Frontend URL loads in the browser.
- Login or any flow that hits `/api/...` works (same-origin rewrite to the API).
- No CORS errors in the browser console (if you see CORS, fix `CORS_ORIGIN` on the API).

---

## Related docs

| File | Purpose |
|------|---------|
| `frontend/Dockerfile` | Multi-stage image (context = `frontend/`) |
| `frontend/DCDeploy_ENV_VARS.md` | Build args + ports |
| `docs/BACKEND_DEPLOYMENT_GUIDE.md` | API deployment |
| `docs/DEPLOYMENT_CHECKLIST.md` | Combined checklist |
| `docs/DEPLOYMENT_ISSUE_LOG.md` | Deployment issues |

---

**Last updated:** 2026-04-07
