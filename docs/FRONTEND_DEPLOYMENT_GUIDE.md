# Frontend deployment guide — NearDrop (DCDeploy)

**Stack:** Next.js 14 App Router, **`output: 'standalone'`** for Docker.  
**Platform:** DCDeploy builds the image from **`frontend/Dockerfile`** (local Docker optional).

---

## Critical: repository root as build context

`@neardrop/web` depends on **`file:../backend/packages/shared`**. The Docker build must see both trees, so:

- **Build context** = **repository root** (the folder that contains `frontend/` and `backend/`).
- **Dockerfile path** = `frontend/Dockerfile`.

If DCDeploy only allows a subdirectory (e.g. `frontend/`) as context, this Dockerfile will **not** work without restructuring the repo or vendoring shared into `frontend/`.

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

See `frontend/DCDeploy_ENV_VARS.md` for a short checklist.

---

## Image layout

1. **Stage `shared-builder`:** compile `backend/packages/shared` (`npm install` + `npm run build`).
2. **Stage `frontend-builder`:** copy built shared into `/app/backend/packages/shared`, `npm ci` in `frontend/`, `npm run build`.
3. **Stage `runner`:** copy `.next/standalone` and `.next/static`, run `node server.js` on port **3020**.

Root **`.dockerignore`** (at repo root) keeps the build context smaller when building the frontend image.

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
| `frontend/Dockerfile` | Multi-stage image (context = repo root) |
| `frontend/DCDeploy_ENV_VARS.md` | Build args + ports |
| `docs/BACKEND_DEPLOYMENT_GUIDE.md` | API deployment |
| `docs/DEPLOYMENT_CHECKLIST.md` | Combined checklist |
| `docs/DEPLOYMENT_ISSUE_LOG.md` | Deployment issues |

---

**Last updated:** 2026-04-07
