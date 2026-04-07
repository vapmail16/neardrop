# DCDeploy — NearDrop frontend (Next.js)

**Build:** DCDeploy runs **`frontend/Dockerfile`** with the **repository root** as build context.  
**Runtime:** Container listens on **3020** (`next` standalone / `PORT`).

---

## Build arguments (required for production)

`API_UPSTREAM` is read when **`next build`** evaluates `next.config.mjs` — it sets the `/api/*` **rewrite** target. It must be the **public base URL of your API** (no path suffix).

**Example (replace with your real API host):**

```text
API_UPSTREAM=https://your-api-service.dcdeploy.cloud
```

In DCDeploy, add this under **Build arguments** / **Docker build args** (not only runtime env), then rebuild the frontend image after the API URL is known.

**Rules:**

- Use **`https://`** in production.
- **No** trailing slash.
- After changing `API_UPSTREAM`, you **must rebuild** the frontend image (rewrites are compile-time for this config).

---

## Runtime environment (optional)

The standalone server usually only needs:

```env
NODE_ENV=production
PORT=3020
```

If your platform injects `PORT` to match an external load balancer, ensure it matches the **exposed** container port you configure in DCDeploy.

---

## Service settings (DCDeploy UI)

| Setting | Value |
| --------| ------|
| **Build context / root directory** | Repository root (where `frontend/` and `backend/` both exist) |
| **Dockerfile path** | `frontend/Dockerfile` |
| **Build argument** | `API_UPSTREAM=<https://your-api-host>` |
| **Container / public port** | **3020** |

---

## After deploy

1. Open the frontend URL in a browser.
2. Confirm network calls: browser → same-origin `/api/...` → rewritten to `API_UPSTREAM`.
3. On the **API**, set **`CORS_ORIGIN`** to your **frontend** origin (scheme + host, e.g. `https://your-frontend.dcdeploy.cloud`) and redeploy the API if needed.

---

## Related

- `docs/FRONTEND_DEPLOYMENT_GUIDE.md`
- `docs/DEPLOYMENT_CHECKLIST.md`
- `backend/DCDeploy_ENV_VARS.md` (API `CORS_ORIGIN`)

---

**Last updated:** 2026-04-07
