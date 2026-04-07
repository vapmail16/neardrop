# Deployment issue log — NearDrop

**Purpose:** Same idea as the reference project: log **deployment** issues (build, DCDeploy, Docker, prod DB, CORS) with cause, fix, and how to avoid next time.  
**General dev issues** stay in `docs/ISSUE_LOG.md`.

**Format:** Date — title — symptom — root cause — fix — prevention.

---

**2026-04-07 — Local Docker build not required** — Teams assumed they must `docker build` on a laptop before DCDeploy. — DCDeploy runs the Dockerfile in the cloud after `git push`. — Documented in `docs/BACKEND_DEPLOYMENT_GUIDE.md` and `backend/DCDeploy_ENV_VARS.md` that **build happens on DCDeploy**; local build is optional for debugging only. — **Prevention:** Treat the Dockerfile as the single source of truth; verify via DCDeploy build logs.

**2026-04-07 — Frontend DCDeploy: context `./frontend` vs monorepo `file:` shared** — DCDeploy matches backend style (**context `./frontend`**, Dockerfile at context root). That tarball has no `../backend`, so `npm ci` could not resolve `file:../backend/packages/shared`. — `frontend/Dockerfile` **clones the repo** in a build stage and copies `backend/packages/shared` into the image, then builds from `/app/frontend`. — **Prevention:** Keep context `./frontend`; set build args `API_UPSTREAM`, and `GIT_REPO`/`GIT_REF` if not using defaults.

**2026-04-07 — Frontend container: wrong `node` entrypoint for standalone** — With `outputFileTracingRoot` set to the monorepo parent, Next emits **`frontend/server.js`** under `.next/standalone/`, not `server.js` at the copy root. Image used `CMD ["node", "server.js"]` and static at `./.next/static`, so the process exited or served without assets. — **Fix:** `CMD ["node", "frontend/server.js"]` and copy static to **`./frontend/.next/static`**. — **Prevention:** After changing `next.config` tracing root, confirm layout with `npm run build` and `find .next/standalone -name server.js`.

**2026-04-07 — Backend pod crash: `JWT_SECRET: Required`** — Image built and started, then Node exited immediately. — `loadConfig()` validates env; DCDeploy service had no `JWT_SECRET` (and sometimes no `DATABASE_URL`). — Set all required vars in DCDeploy → Environment (see `backend/DCDeploy_ENV_VARS.md`). — **Prevention:** Treat env checklist as part of “first deploy”; confirm logs show `API listening` before calling health.

---

(Add new entries below this line.)
