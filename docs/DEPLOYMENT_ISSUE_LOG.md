# Deployment issue log — NearDrop

**Purpose:** Same idea as the reference project: log **deployment** issues (build, DCDeploy, Docker, prod DB, CORS) with cause, fix, and how to avoid next time.  
**General dev issues** stay in `docs/ISSUE_LOG.md`.

**Format:** Date — title — symptom — root cause — fix — prevention.

---

**2026-04-07 — Local Docker build not required** — Teams assumed they must `docker build` on a laptop before DCDeploy. — DCDeploy runs the Dockerfile in the cloud after `git push`. — Documented in `docs/BACKEND_DEPLOYMENT_GUIDE.md` and `backend/DCDeploy_ENV_VARS.md` that **build happens on DCDeploy**; local build is optional for debugging only. — **Prevention:** Treat the Dockerfile as the single source of truth; verify via DCDeploy build logs.

---

(Add new entries below this line.)
