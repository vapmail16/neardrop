# API reference (MVP)

## Health

| Method | Path             | Description                                  |
| ------ | ---------------- | -------------------------------------------- |
| GET    | `/api/v1/health` | Liveness + PostgreSQL connectivity check |

## Auth (Phase 1)

| Method | Path | Role | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/v1/auth/register` | Public | Register (creates `carriers` / `affiliates` row when role is carrier / affiliate) |
| POST | `/api/v1/auth/login` | Public | Login (rate limited) |
| POST | `/api/v1/auth/refresh` | Cookie | Rotate tokens |
| POST | `/api/v1/auth/logout` | Auth | Revoke refresh tokens |
| GET | `/api/v1/auth/me` | Auth | Profile |
| GET | `/api/v1/auth/ops-ping` | Ops | RBAC smoke |

## Parcels (Phase 2–3)

| Method | Path | Role | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/v1/parcels/manifest` | Carrier | JSON or CSV manifest; exact-postcode affiliate match; optional customer link by `recipientEmail` |
| GET | `/api/v1/parcels` | Auth | Paginated list (carrier / affiliate / customer / ops scoped) |
| GET | `/api/v1/parcels/:parcelId` | Auth | Detail (same visibility rules) |
| GET | `/api/v1/parcels/:parcelId/collection-qr` | Customer | Returns JWT `qrToken` + `expiresAt` when parcel is `ready_to_collect` (for QR display; web or native) |
| POST | `/api/v1/parcels/:parcelId/collect` | Affiliate | Body `{ "qrToken": "…" }`; validates token, sets `collected`, records earning, invalidates QR. Use cookie or `Authorization: Bearer` |
| PATCH | `/api/v1/parcels/:parcelId/status` | Authenticated | State transitions per role; `ready_to_collect` → `collected` is **not** available to affiliates (use `POST …/collect`). Else `403` / `422` (`INVALID_STATE_TRANSITION`) |

Portal UIs and remaining domains: Phases 3–7 per `NEARDROP_MVP_IMPLEMENTATION_PLAN.md`.
