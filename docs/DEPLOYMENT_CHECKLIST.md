# Deployment checklist — NearDrop

Quick reference. **Docker images are built on DCDeploy**; local `docker build` is optional.

---

## Before first backend deploy

- [ ] `backend/package-lock.json` committed (reproducible `npm ci` in Dockerfile).
- [ ] Production `DATABASE_URL` set in DCDeploy; migrations applied (`cd backend && npm run migrate` with prod URL).
- [ ] `JWT_SECRET` (32+ chars) set only in DCDeploy / secret store — not in git.
- [ ] `CORS_ORIGIN` set to the deployed **frontend** origin (update when frontend URL is known).
- [ ] Service **port 3010** and Dockerfile path / context configured (see `docs/BACKEND_DEPLOYMENT_GUIDE.md`).

## After backend deploy

- [ ] `GET /api/v1/health` returns 200 and `database: connected`.
- [ ] Smoke test login or public route as appropriate.

## Before first frontend deploy

- [ ] `frontend/package-lock.json` committed.
- [ ] DCDeploy **build context** is the **repo root** (not only `frontend/`), Dockerfile **`frontend/Dockerfile`** (see `docs/FRONTEND_DEPLOYMENT_GUIDE.md`).
- [ ] **Build argument** `API_UPSTREAM` set to the public **https** API base URL (no trailing slash); triggers a rebuild when the API URL changes.
- [ ] Container / routing port **3020** matches `PORT` and the platform mapping.

## After frontend deploy

- [ ] Site loads; `/api/...` calls succeed (rewrites to `API_UPSTREAM`).
- [ ] API **`CORS_ORIGIN`** updated to the frontend origin and backend redeployed if needed.

## If something fails

- [ ] Capture DCDeploy build + runtime logs.
- [ ] Add an entry to `docs/DEPLOYMENT_ISSUE_LOG.md` (symptom → cause → fix → prevention).

---

**Last updated:** 2026-04-07
