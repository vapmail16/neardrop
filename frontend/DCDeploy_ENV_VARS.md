# DCDeploy — NearDrop frontend (Next.js)

**Build:** DCDeploy uses **build context `./frontend`** and **`./Dockerfile`** (same pattern as the backend service).  
**Runtime:** The container listens on **`PORT`** (default **3000**). Align DCDeploy’s **internal/container port** and **`PORT`** env with **3000** unless the platform overrides `PORT` automatically.

---

## Build arguments

### `API_UPSTREAM` (required for production)

Read when **`next build`** evaluates `next.config.mjs` — sets the `/api/*` **rewrite** target. Must be the **public base URL of your API** (no path suffix).

**Example:**

```text
API_UPSTREAM=https://your-api-service.dcdeploy.cloud
```

Add under **Build arguments** / **Docker build args**, then rebuild after the API URL is known.

**Rules:**

- Use **`https://`** in production.
- **No** trailing slash.
- After changing `API_UPSTREAM`, **rebuild** the frontend image.

### Shared package note

`@neardrop/shared` is vendored at `frontend/packages/shared` and resolved as `file:./packages/shared`.
This keeps frontend Docker builds self-contained with context `./frontend` (no repo clone step).

---

## Runtime environment (optional)

```env
NODE_ENV=production
PORT=3000
```

If the platform injects `PORT`, match the **exposed** container port to that value.

---

## Service settings (DCDeploy UI)

| Setting | Value |
| --------| ------|
| **Context / root directory** | `./frontend` |
| **Dockerfile** | `./Dockerfile` |
| **Build arguments** | `API_UPSTREAM=<https://your-api-host>` |
| **Container port** | **3000** (and set **`PORT=3000`** if the platform does not inject it) |

Do **not** assume port **80** inside the container unless you run as root and configure the app for 80; this image runs as non-root and defaults to **3000**.

---

## After deploy

1. Open the frontend URL in a browser.
2. Confirm network calls: same-origin `/api/...` → rewritten to `API_UPSTREAM`.
3. On the **API**, set **`CORS_ORIGIN`** to the **frontend** origin and redeploy the API if needed.

---

## Related

- `docs/FRONTEND_DEPLOYMENT_GUIDE.md`
- `docs/DEPLOYMENT_CHECKLIST.md`
- `backend/DCDeploy_ENV_VARS.md` (API `CORS_ORIGIN`)

---

**Last updated:** 2026-04-07
