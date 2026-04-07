# Phase 2 — Manual testing checklist (Parcels + state machine)

Use after **Phase 1** is green. Working directory: **`project_scaffolding/`**.

**References**

- Plan: `docs/NEARDROP_MVP_IMPLEMENTATION_PLAN.md` §9 Phase 2 (Parcel Service + State Machine).
- API: `docs/API_REFERENCE.md` (Parcels section).
- Automated DB suite: `npm run test:integration` (includes **Phase 2 parcel flow** + Phase 0/1 integration tests).

**Tester & environment**

| Field | Value |
| ----- | ----- |
| Tester name | Automated verification (IDE agent) — replace with human name if required |
| Date | 2026-04-04 (UTC) |
| Node.js (`node -v`) | v20.20.0 |
| PostgreSQL | Local (per `.env` `DATABASE_URL`) |
| Branch / commit (`git rev-parse HEAD`) | `02ac5ee25c0aeccf9582b7bcebba049b27332c63` (re-check with `git rev-parse HEAD`) |

---

## 1. Automated gates (run first)

| # | Command | Expected | Pass |
| --- | --- | --- | --- |
| 1.1 | `npm run migrate` | Success (`Already up to date` OK). | [x] |
| 1.2 | `npm run test` | All workspace Vitest suites pass (API may show DB integration files **skipped** without `RUN_DB_INTEGRATION` — expected). | [x] |
| 1.3 | `npm run test:integration` | Exit **0**; **12** tests, **7** files — schema, user repo, auth flow, health DB, Phase 2 & 3 parcel flows, **affiliates** (with `DATABASE_URL`). | [x] |
| 1.4 | `npm run lint` && `npm run typecheck` && `npm run build` | All exit **0**. | [x] |

---

## 2. API manual smoke (Terminal A: API dev)

**Terminal A** — start API: `npm run dev --workspace=@neardrop/api` (default **3010**).

**Option A — scripted smoke (recommended)**  
From `project_scaffolding/`:

```bash
bash scripts/manual-test-phase2-smoke.sh
```

Uses fresh emails per run; requires API already listening on `http://127.0.0.1:3010`. For **Phases 1–3** in one go: `bash scripts/run-all-manual-smokes.sh`.

**Option B — curl by hand**  
Password: `GoodPassw0rd!`. Use a shared hub postcode for affiliate + manifest row, e.g. **`E1 6AN`**. Replace emails with unique values.

| # | Step | Expected | Pass |
| --- | --- | --- | --- |
| 2.1 | Register **customer** with `postcode` = hub; save cookies e.g. `-c /tmp/nd-p2-cust.txt` | HTTP **200** | [x] |
| 2.2 | Register **affiliate** with same `postcode` as hub; save `-c /tmp/nd-p2-aff.txt` | HTTP **200** | [x] |
| 2.3 | Register **carrier**; save `-c /tmp/nd-p2-car.txt` | HTTP **200** | [x] |
| 2.4 | `POST /api/v1/parcels/manifest` with `-b /tmp/nd-p2-car.txt`, body `{"format":"json","rows":[{"carrierRef":"M1","recipientName":"R","recipientPostcode":"E1 6AN","recipientEmail":"<customer-email>"}]}` | HTTP **200**; `data.matchedAffiliate` **1**, `data.unmatched` **0**, `parcelIds[0]` present | [x] |
| 2.5 | `GET /api/v1/parcels` as carrier | HTTP **200**; `data.total` ≥ **1** | [x] |
| 2.6 | `GET /api/v1/parcels` as affiliate | HTTP **200**; same parcel listed | [x] |
| 2.7 | `GET /api/v1/parcels/:id` as customer (linked by email) | HTTP **200** | [x] |
| 2.8 | `PATCH .../status` `{"status":"in_transit"}` as **carrier** | HTTP **200** | [x] |
| 2.9 | `PATCH .../status` `{"status":"dropped_at_affiliate"}` as **affiliate** | HTTP **200** | [x] |
| 2.10 | `PATCH .../status` `{"status":"ready_to_collect"}` as **carrier** | HTTP **200** | [x] |
| 2.11 | `GET /api/v1/parcels/:id/collection-qr` as **customer** (parcel must be `ready_to_collect`) | HTTP **200**; `data.qrToken` and `data.expiresAt` present | [x] |
| 2.12 | `POST /api/v1/parcels/:id/collect` as **affiliate** with body `{"qrToken":"<from 2.11>"}` (cookie or `Authorization: Bearer`) | HTTP **200**; `data.parcel.status` **`collected`** | [x] |
| 2.13 | `PATCH .../status` `{"status":"in_transit"}` again as carrier | HTTP **422**; error code **`INVALID_STATE_TRANSITION`** | [x] |
| 2.14 | `POST /api/v1/parcels/manifest` as **affiliate** (wrong role) | HTTP **403** | [x] |

**Evidence (automated run)**

- **Date / commit:** 2026-04-02 / `02ac5ee25c0aeccf9582b7bcebba049b27332c63` (verify with `git rev-parse HEAD`).
- **§1.1–1.4:** All commands exited **0** in one chained run (`migrate`, `test`, `test:integration`, `lint`, `typecheck`, `build`).
- **§2 script:** `bash scripts/manual-test-phase2-smoke.sh` after `npm run dev --workspace=@neardrop/api` on **3010** — final line **`Phase 2 smoke: ALL OK`**; sample parcel id from run: `0a15ffe4-d06d-493c-a315-645fbfad9f73` (each run uses new emails under `manual-p2-*@example.com`).
- **API log (optional):** `/tmp/nd-api-p2-manual.log`

---

## 3. Phase 2 sign-off

| # | Question | Pass |
| --- | --- | --- |
| 3.1 | All rows in §1–§2 completed with no blocking failures? | [x] |
| 3.2 | Ready to freeze Phase 2 and plan Phase 3 (QR + notifications) after explicit go-ahead? | [x] |

**Sign-off**

- Tester: Automated verification (IDE agent) — **you** may re-sign when satisfied  
- Date: 2026-04-04  

**Regression:** Run `bash scripts/manual-test-phase1-smoke.sh` before Phase 2 smoke if you want a full Phase 1 re-check, or `bash scripts/run-all-manual-smokes.sh` for Phases 1–3 together.

---

## Out of scope for Phase 2 (this checklist)

Email notifications beyond what the API logs, carrier portal UI polish (Phase 4+). This checklist validates **backend** parcels, manifest import, postcode matching, RBAC-scoped list/detail, state machine + history, and **affiliate collection via `POST …/collect`** (shared with Phase 3). Affiliates no longer use `PATCH …/status` → `collected` (that transition is **ops-only**).
