# Phase 3 — Manual testing checklist (QR collection + notifications)

Use after **Phase 2** is green. Working directory: **`project_scaffolding/`**.

**References**

- Plan: `docs/NEARDROP_MVP_IMPLEMENTATION_PLAN.md` §9 Phase 3 (QR Collection + Notification).
- API: `docs/API_REFERENCE.md` (Parcels — `collection-qr`, `collect`).
- Phase 2 parcel flow: `docs/MANUAL_TEST_PHASE_2.md`.

**Tester & environment**

| Field | Value |
| ----- | ----- |
| Tester name | Automated verification (IDE agent) — replace with human name if required |
| Date | 2026-04-04 (UTC) |
| Node.js (`node -v`) | v20.20.0 |
| PostgreSQL | Local (`DATABASE_URL` in `.env`) |
| Branch / commit (`git rev-parse HEAD`) | `02ac5ee25c0aeccf9582b7bcebba049b27332c63` (re-check before release) |

---

## 1. Automated gates (run first — no steps skipped)

| # | Command | Expected | Pass |
| --- | --- | --- | --- |
| 1.1 | `npm run migrate` | Exit **0** (`Already up to date` OK). Includes `parcels.qr_token_used_at` and related indexes. | [x] |
| 1.2 | `npm run test` | Exit **0**; all workspace Vitest suites pass (shared, API, web). Includes **`qr-token.service.test.ts`**, **`notification.service.test.ts`**. | [x] |
| 1.3 | `npm run test:integration` | Exit **0** with `DATABASE_URL`; root sets `RUN_DB_INTEGRATION=1`. **12** tests, **7** files (schema, user repo, auth flow ×3, health DB, parcel phase 2 & 3, **affiliates**). | [x] |
| 1.4 | `npm run lint` && `npm run typecheck` && `npm run build` | All exit **0**. | [x] |

**Regression (Phases 0–2)** — same session:

| # | Command / action | Expected | Pass |
| --- | --- | --- | --- |
| 1.5 | Phase 0 evidence | `npm run record:phase0-evidence` → `docs/evidence/phase-0-exit-gates.md` updated (**verified**). | [x] |
| 1.6 | `bash scripts/manual-test-phase1-smoke.sh` | **`Phase 1 smoke: ALL OK`**. | [x] |
| 1.7 | `bash scripts/manual-test-phase2-smoke.sh` | **`Phase 2 smoke: ALL OK`**. | [x] |

---

## 2. API manual smoke — Phase 3 behaviours (scripted)

**Terminal A** — API: `npm run dev --workspace=@neardrop/api` (**3010**).

**Script (required — exercises every case; asserts HTTP + `error.code` where applicable)**

```bash
bash scripts/manual-test-phase3-smoke.sh
```

**One-shot (Phases 1 + 2 + 3):** `bash scripts/run-all-manual-smokes.sh`

| # | Case | Expected HTTP / JSON | Pass |
| --- | --- | --- | --- |
| 3.1 | `GET .../collection-qr` as customer while parcel **not** `ready_to_collect` | **409**, **`QR_NOT_READY`** | [x] |
| 3.2 | Same after **`in_transit`** only | **409**, **`QR_NOT_READY`** | [x] |
| 3.3 | `GET .../collection-qr` when **`ready_to_collect`** | **200**, `data.qrToken`, `data.expiresAt` | [x] |
| 3.4 | `POST .../collect`, **`qrToken` too short** | **400**, **`VALIDATION_ERROR`** | [x] |
| 3.5 | `POST .../collect` as **customer** | **403**, **`FORBIDDEN`** | [x] |
| 3.6 | `POST .../collect` as **other affiliate** | **403**, **`FORBIDDEN`** | [x] |
| 3.7 | `POST .../collect`, **invalid JWT** (64× `x`) | **401**, **`INVALID_QR_TOKEN`** | [x] |
| 3.8 | `POST .../collect` with **`Authorization: Bearer`** only | **200**, `data.parcel.status` **`collected`** | [x] |
| 3.9 | **Replay** same `qrToken` | **409**, **`QR_NOT_READY`** | [x] |
| 3.10 | `GET .../collection-qr` after **collected** | **409**, **`QR_NOT_READY`** | [x] |

---

## 3. Notifications (observability)

| # | Step | Expected | Pass |
| --- | --- | --- | --- |
| 3.N.1 | API logs during §2 script | **`email_outbound`** after `ready_to_collect` and after successful collect (logging channel in dev). | [x] |
| 3.N.2 | DB / integration | **`parcel.phase3.integration.test.ts`** asserts `notifications` rows for **`parcel_collected`**; optional manual SQL omitted when integration green. | [x] |

---

## 4. Phase 3 sign-off

| # | Question | Pass |
| --- | --- | --- |
| 4.1 | All rows in §1–§3 completed with no blocking failures? | [x] |
| 4.2 | Ready to freeze Phase 3 and plan Phase 4 (carrier portal UI)? | [x] |

**Sign-off**

- Tester: Automated verification (IDE agent) — **you** may re-sign when satisfied  
- Date: 2026-04-04  

---

## Out of scope for Phase 3 (this checklist)

Production SMTP, push/SMS channels, and full carrier/customer **portal** QR UIs (Phase 4+). This phase validates **API** QR issuance, collection, earnings side-effects, and **email channel** wiring (logging in dev).
