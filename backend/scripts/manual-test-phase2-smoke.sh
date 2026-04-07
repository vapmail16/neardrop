#!/usr/bin/env bash
# Repeatable curl smoke for docs/MANUAL_TEST_PHASE_2.md §2.
# Prerequisites: PostgreSQL up; project_scaffolding/.env with DATABASE_URL + JWT_SECRET (32+ chars).
# Usage (from repo): bash scripts/manual-test-phase2-smoke.sh [API_BASE]
# Default API_BASE=http://127.0.0.1:3010 — start API first: cd backend && npm run dev
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"
API="${1:-http://127.0.0.1:3010}"
TS="$(date +%s)"
PW='GoodPassw0rd!'
# Unique hub per run (valid UK shape per shared isLikelyUkPostcode; avoids PH{n}/19 colliding across runs)
HUB="$(printf 'B%02d %dTH' $(((TS + $$) % 100)) $(((TS + RANDOM) % 10)))"
EMAIL_CUST="manual-p2-cust-${TS}@example.com"
EMAIL_AFF="manual-p2-aff-${TS}@example.com"
EMAIL_CAR="manual-p2-car-${TS}@example.com"

echo "== Phase 2 smoke → ${API} (ts=${TS})"

for i in $(seq 1 40); do
  if curl -sf "${API}/api/v1/health" >/dev/null 2>&1; then
    echo "OK health reachable"
    break
  fi
  if [[ "$i" -eq 40 ]]; then
    echo "FAIL: API not reachable at ${API}/api/v1/health (start: cd backend && npm run dev)" >&2
    exit 1
  fi
  sleep 0.5
done

code() { curl -sS -o /tmp/nd-p2-body.txt -w '%{http_code}' "$@"; }

code_qr() { curl -sS -o /tmp/nd-p2-qr-body.txt -w '%{http_code}' "$@"; }

echo "-- register customer"
C1="$(code -c /tmp/nd-p2-cust.txt -H 'Content-Type: application/json' -d "{\"email\":\"${EMAIL_CUST}\",\"password\":\"${PW}\",\"firstName\":\"C\",\"lastName\":\"U\",\"role\":\"customer\",\"postcode\":\"${HUB}\"}" "${API}/api/v1/auth/register")"
echo "register customer: HTTP ${C1}"
[[ "$C1" == "200" ]]

echo "-- register affiliate (same hub)"
C2="$(code -c /tmp/nd-p2-aff.txt -H 'Content-Type: application/json' -d "{\"email\":\"${EMAIL_AFF}\",\"password\":\"${PW}\",\"firstName\":\"A\",\"lastName\":\"F\",\"role\":\"affiliate\",\"postcode\":\"${HUB}\",\"addressLine1\":\"42 Smoke Pickup Lane\"}" "${API}/api/v1/auth/register")"
echo "register affiliate: HTTP ${C2}"
[[ "$C2" == "200" ]]

echo "-- register carrier"
C3="$(code -c /tmp/nd-p2-car.txt -H 'Content-Type: application/json' -d "{\"email\":\"${EMAIL_CAR}\",\"password\":\"${PW}\",\"firstName\":\"C\",\"lastName\":\"R\",\"role\":\"carrier\"}" "${API}/api/v1/auth/register")"
echo "register carrier: HTTP ${C3}"
[[ "$C3" == "200" ]]

echo "-- POST manifest (JSON)"
C4="$(code -b /tmp/nd-p2-car.txt -H 'Content-Type: application/json' -d "{\"format\":\"json\",\"rows\":[{\"carrierRef\":\"M-${TS}\",\"recipientName\":\"Recipient\",\"recipientPostcode\":\"${HUB}\",\"recipientEmail\":\"${EMAIL_CUST}\"}]}" "${API}/api/v1/parcels/manifest")"
echo "manifest: HTTP ${C4}"
[[ "$C4" == "200" ]]
PARCEL_ID="$(node -e "const j=require('fs').readFileSync('/tmp/nd-p2-body.txt','utf8'); const o=JSON.parse(j); process.stdout.write((o.data&&o.data.parcelIds&&o.data.parcelIds[0])||'');")"
[[ -n "$PARCEL_ID" ]]
echo "parcelId=${PARCEL_ID}"
grep -q '"matchedAffiliate":1' /tmp/nd-p2-body.txt || { echo "FAIL: expected matchedAffiliate 1"; exit 1; }

echo "-- GET /parcels (carrier)"
C5="$(code -b /tmp/nd-p2-car.txt "${API}/api/v1/parcels")"
echo "list carrier: HTTP ${C5}"
[[ "$C5" == "200" ]]

echo "-- GET /parcels (affiliate)"
C6="$(code -b /tmp/nd-p2-aff.txt "${API}/api/v1/parcels")"
echo "list affiliate: HTTP ${C6}"
[[ "$C6" == "200" ]]

echo "-- GET parcel (customer, linked)"
C7="$(code -b /tmp/nd-p2-cust.txt "${API}/api/v1/parcels/${PARCEL_ID}")"
echo "get customer: HTTP ${C7}"
[[ "$C7" == "200" ]]

echo "-- PATCH in_transit (carrier)"
C8="$(code -b /tmp/nd-p2-car.txt -X PATCH -H 'Content-Type: application/json' -d '{"status":"in_transit"}' "${API}/api/v1/parcels/${PARCEL_ID}/status")"
echo "patch in_transit: HTTP ${C8}"
[[ "$C8" == "200" ]]

echo "-- PATCH dropped_at_affiliate (affiliate)"
C9="$(code -b /tmp/nd-p2-aff.txt -X PATCH -H 'Content-Type: application/json' -d '{"status":"dropped_at_affiliate"}' "${API}/api/v1/parcels/${PARCEL_ID}/status")"
echo "patch dropped: HTTP ${C9}"
[[ "$C9" == "200" ]]

echo "-- PATCH ready_to_collect (carrier)"
C10="$(code -b /tmp/nd-p2-car.txt -X PATCH -H 'Content-Type: application/json' -d '{"status":"ready_to_collect"}' "${API}/api/v1/parcels/${PARCEL_ID}/status")"
echo "patch ready: HTTP ${C10}"
[[ "$C10" == "200" ]]

echo "-- GET collection-qr (customer) — Phase 3 handover token"
C11="$(code_qr -b /tmp/nd-p2-cust.txt "${API}/api/v1/parcels/${PARCEL_ID}/collection-qr")"
echo "get collection-qr: HTTP ${C11}"
[[ "$C11" == "200" ]]
node -e "
const fs = require('fs');
const o = JSON.parse(fs.readFileSync('/tmp/nd-p2-qr-body.txt', 'utf8'));
if (!o.data || !o.data.qrToken) process.exit(1);
fs.writeFileSync('/tmp/nd-p2-collect.json', JSON.stringify({ qrToken: o.data.qrToken }));
"

echo "-- POST collect (affiliate cookie — same as Bearer for mobile)"
C11b="$(code -b /tmp/nd-p2-aff.txt -X POST -H 'Content-Type: application/json' --data-binary @/tmp/nd-p2-collect.json "${API}/api/v1/parcels/${PARCEL_ID}/collect")"
echo "post collect: HTTP ${C11b}"
[[ "$C11b" == "200" ]]
node -e "const j=JSON.parse(require('fs').readFileSync('/tmp/nd-p2-body.txt','utf8')); if(j.data?.parcel?.status!=='collected') process.exit(1);" || { echo "FAIL: expected data.parcel.status collected"; exit 1; }

echo "-- PATCH invalid transition (expect 422)"
C12="$(code -b /tmp/nd-p2-car.txt -X PATCH -H 'Content-Type: application/json' -d '{"status":"in_transit"}' "${API}/api/v1/parcels/${PARCEL_ID}/status")"
echo "patch invalid: HTTP ${C12}"
[[ "$C12" == "422" ]]

echo "-- POST manifest as affiliate (expect 403)"
C13="$(code -b /tmp/nd-p2-aff.txt -H 'Content-Type: application/json' -d "{\"format\":\"json\",\"rows\":[{\"carrierRef\":\"X\",\"recipientName\":\"Y\",\"recipientPostcode\":\"${HUB}\"}]}" "${API}/api/v1/parcels/manifest")"
echo "manifest as affiliate: HTTP ${C13}"
[[ "$C13" == "403" ]]

echo "== Phase 2 smoke: ALL OK"
