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

## Frontend (separate service)

- [ ] `frontend/.env` / build args point `API_UPSTREAM` or `NEXT_PUBLIC_*` at the deployed API URL.
- [ ] CORS on API matches the deployed frontend origin.

## If something fails

- [ ] Capture DCDeploy build + runtime logs.
- [ ] Add an entry to `docs/DEPLOYMENT_ISSUE_LOG.md` (symptom → cause → fix → prevention).

---

**Last updated:** 2026-04-07
