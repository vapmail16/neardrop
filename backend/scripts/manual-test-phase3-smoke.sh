#!/usr/bin/env bash
# Repeatable curl smoke for docs/MANUAL_TEST_PHASE_3.md §2 (QR + collect + RBAC + errors).
# Prerequisites: PostgreSQL; .env DATABASE_URL + JWT_SECRET (32+). Latest migrations applied.
# Usage: bash scripts/manual-test-phase3-smoke.sh [API_BASE]
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"
API="${1:-http://127.0.0.1:3010}"
TS="$(date +%s)"
PW='GoodPassw0rd!'
HUB="$(printf 'B%02d %dTH' $(((TS + $$ + 7) % 100)) $(((TS + RANDOM + 3) % 10)))"
HUB2="$(printf 'C%02d %dTH' $(((TS + $$ + 11) % 100)) $(((TS + RANDOM + 5) % 10)))"
EMAIL_CUST="manual-p3-cust-${TS}@example.com"
EMAIL_AFF1="manual-p3-aff1-${TS}@example.com"
EMAIL_AFF2="manual-p3-aff2-${TS}@example.com"
EMAIL_CAR="manual-p3-car-${TS}@example.com"

echo "== Phase 3 smoke -> ${API} (ts=${TS}) hub=${HUB} hub2=${HUB2}"

for i in $(seq 1 40); do
  if curl -sf "${API}/api/v1/health" >/dev/null 2>&1; then
    echo "OK health reachable"
    break
  fi
  if [[ "$i" -eq 40 ]]; then
    echo "FAIL: API not reachable at ${API}/api/v1/health" >&2
    exit 1
  fi
  sleep 0.5
done

code() { curl -sS -o /tmp/nd-p3-body.txt -w '%{http_code}' "$@"; }
code_qr() { curl -sS -o /tmp/nd-p3-qr-body.txt -w '%{http_code}' "$@"; }

expect_json_code() {
  local want="$1"
  local got
  got="$(node -e "try{const j=JSON.parse(require('fs').readFileSync('/tmp/nd-p3-body.txt','utf8')); process.stdout.write(String(j.error&&j.error.code||''));}catch(e){process.stdout.write('');}")"
  [[ "$got" == "$want" ]] || {
    echo "FAIL: expected error.code=${want} got '${got}' body=$(head -c 400 /tmp/nd-p3-body.txt)" >&2
    exit 1
  }
}

# --- Register + manifest
echo "-- register customer / affiliate1 / carrier"
[[ "$(code -c /tmp/nd-p3-cust.txt -H 'Content-Type: application/json' -d "{\"email\":\"${EMAIL_CUST}\",\"password\":\"${PW}\",\"firstName\":\"C\",\"lastName\":\"U\",\"role\":\"customer\",\"postcode\":\"${HUB}\"}" "${API}/api/v1/auth/register")" == "200" ]]
[[ "$(code -c /tmp/nd-p3-aff1.txt -H 'Content-Type: application/json' -d "{\"email\":\"${EMAIL_AFF1}\",\"password\":\"${PW}\",\"firstName\":\"A\",\"lastName\":\"1\",\"role\":\"affiliate\",\"postcode\":\"${HUB}\",\"addressLine1\":\"1 Smoke Hub Street\"}" "${API}/api/v1/auth/register")" == "200" ]]
[[ "$(code -c /tmp/nd-p3-car.txt -H 'Content-Type: application/json' -d "{\"email\":\"${EMAIL_CAR}\",\"password\":\"${PW}\",\"firstName\":\"C\",\"lastName\":\"R\",\"role\":\"carrier\"}" "${API}/api/v1/auth/register")" == "200" ]]

echo "-- register affiliate2 (different hub - not parcel owner)"
[[ "$(code -c /tmp/nd-p3-aff2.txt -H 'Content-Type: application/json' -d "{\"email\":\"${EMAIL_AFF2}\",\"password\":\"${PW}\",\"firstName\":\"A\",\"lastName\":\"2\",\"role\":\"affiliate\",\"postcode\":\"${HUB2}\",\"addressLine1\":\"2 Other Hub Street\"}" "${API}/api/v1/auth/register")" == "200" ]]

echo "-- POST manifest"
[[ "$(code -b /tmp/nd-p3-car.txt -H 'Content-Type: application/json' -d "{\"format\":\"json\",\"rows\":[{\"carrierRef\":\"P3-${TS}\",\"recipientName\":\"R\",\"recipientPostcode\":\"${HUB}\",\"recipientEmail\":\"${EMAIL_CUST}\"}]}" "${API}/api/v1/parcels/manifest")" == "200" ]]
PARCEL_ID="$(node -e "const j=require('fs').readFileSync('/tmp/nd-p3-body.txt','utf8'); const o=JSON.parse(j); process.stdout.write((o.data&&o.data.parcelIds&&o.data.parcelIds[0])||'');")"
[[ -n "$PARCEL_ID" ]]
echo "parcelId=${PARCEL_ID}"

# --- 3.1 GET collection-qr too early (manifest_received)
echo "-- 3.1 GET collection-qr before ready_to_collect (expect 409 QR_NOT_READY)"
E1="$(code_qr -b /tmp/nd-p3-cust.txt "${API}/api/v1/parcels/${PARCEL_ID}/collection-qr")"
echo "early collection-qr: HTTP ${E1}"
[[ "$E1" == "409" ]]
cp /tmp/nd-p3-qr-body.txt /tmp/nd-p3-body.txt
expect_json_code "QR_NOT_READY"

# --- in_transit then 3.2 still not ready
echo "-- PATCH in_transit"
[[ "$(code -b /tmp/nd-p3-car.txt -X PATCH -H 'Content-Type: application/json' -d '{"status":"in_transit"}' "${API}/api/v1/parcels/${PARCEL_ID}/status")" == "200" ]]

echo "-- 3.2 GET collection-qr in_transit (expect 409)"
E2="$(code_qr -b /tmp/nd-p3-cust.txt "${API}/api/v1/parcels/${PARCEL_ID}/collection-qr")"
echo "in_transit collection-qr: HTTP ${E2}"
[[ "$E2" == "409" ]]
cp /tmp/nd-p3-qr-body.txt /tmp/nd-p3-body.txt
expect_json_code "QR_NOT_READY"

echo "-- PATCH dropped + ready"
[[ "$(code -b /tmp/nd-p3-aff1.txt -X PATCH -H 'Content-Type: application/json' -d '{"status":"dropped_at_affiliate"}' "${API}/api/v1/parcels/${PARCEL_ID}/status")" == "200" ]]
[[ "$(code -b /tmp/nd-p3-car.txt -X PATCH -H 'Content-Type: application/json' -d '{"status":"ready_to_collect"}' "${API}/api/v1/parcels/${PARCEL_ID}/status")" == "200" ]]

echo "-- 3.3 GET collection-qr OK + persist token"
E3="$(code_qr -b /tmp/nd-p3-cust.txt "${API}/api/v1/parcels/${PARCEL_ID}/collection-qr")"
echo "collection-qr: HTTP ${E3}"
[[ "$E3" == "200" ]]
node -e "
const fs = require('fs');
const o = JSON.parse(fs.readFileSync('/tmp/nd-p3-qr-body.txt', 'utf8'));
if (!o.data?.qrToken || !o.data?.expiresAt) process.exit(1);
fs.writeFileSync('/tmp/nd-p3-collect.json', JSON.stringify({ qrToken: o.data.qrToken }));
fs.writeFileSync('/tmp/nd-p3-qr-token.txt', o.data.qrToken, 'utf8');
"

echo "-- 3.4 POST collect body invalid (qrToken too short - expect 400 VALIDATION_ERROR)"
printf '%s' '{"qrToken":"short"}' >/tmp/nd-p3-bad.json
B4="$(code -b /tmp/nd-p3-aff1.txt -X POST -H 'Content-Type: application/json' --data-binary @/tmp/nd-p3-bad.json "${API}/api/v1/parcels/${PARCEL_ID}/collect")"
echo "collect short token: HTTP ${B4}"
[[ "$B4" == "400" ]]
expect_json_code "VALIDATION_ERROR"

echo "-- 3.5 POST collect as customer (expect 403 FORBIDDEN)"
B5="$(code -b /tmp/nd-p3-cust.txt -X POST -H 'Content-Type: application/json' --data-binary @/tmp/nd-p3-collect.json "${API}/api/v1/parcels/${PARCEL_ID}/collect")"
echo "collect as customer: HTTP ${B5}"
[[ "$B5" == "403" ]]
expect_json_code "FORBIDDEN"

echo "-- 3.6 POST collect as wrong affiliate (expect 403)"
B6="$(code -b /tmp/nd-p3-aff2.txt -X POST -H 'Content-Type: application/json' --data-binary @/tmp/nd-p3-collect.json "${API}/api/v1/parcels/${PARCEL_ID}/collect")"
echo "collect as aff2: HTTP ${B6}"
[[ "$B6" == "403" ]]
expect_json_code "FORBIDDEN"

echo "-- 3.7 POST collect invalid JWT string (expect 401 INVALID_QR_TOKEN)"
node -e "require('fs').writeFileSync('/tmp/nd-p3-badjwt.json', JSON.stringify({ qrToken: 'x'.repeat(64) }));"
B7="$(code -b /tmp/nd-p3-aff1.txt -X POST -H 'Content-Type: application/json' --data-binary @/tmp/nd-p3-badjwt.json "${API}/api/v1/parcels/${PARCEL_ID}/collect")"
echo "collect garbage jwt: HTTP ${B7}"
[[ "$B7" == "401" ]]
expect_json_code "INVALID_QR_TOKEN"

# Netscape cookie jar (single-quoted node -e avoids bash treating # as comment mid-line)
AFF1_ACCESS="$(node -e 'const fs=require("fs");for(const line of fs.readFileSync("/tmp/nd-p3-aff1.txt","utf8").split("\n")){if(!line.trim())continue;if(line.startsWith("#")&&!line.startsWith("#HttpOnly"))continue;const p=line.split("\t");if(p[5]==="nd_access"){process.stdout.write(p[6]||"");break;}}')"
[[ -n "$AFF1_ACCESS" ]] || { echo "FAIL: could not parse nd_access from aff1 cookie jar" >&2; exit 1; }

echo "-- 3.8 POST collect with Authorization Bearer only (no Cookie)"
B8="$(curl -sS -o /tmp/nd-p3-body.txt -w '%{http_code}' -X POST -H 'Content-Type: application/json' -H "Authorization: Bearer ${AFF1_ACCESS}" --data-binary @/tmp/nd-p3-collect.json "${API}/api/v1/parcels/${PARCEL_ID}/collect")"
echo "collect Bearer: HTTP ${B8}"
[[ "$B8" == "200" ]]
node -e "const j=JSON.parse(require('fs').readFileSync('/tmp/nd-p3-body.txt','utf8')); if(j.data?.parcel?.status!=='collected') process.exit(1);"

echo "-- 3.9 POST collect replay same qrToken (expect 409)"
B9="$(curl -sS -o /tmp/nd-p3-body.txt -w '%{http_code}' -X POST -H 'Content-Type: application/json' -H "Authorization: Bearer ${AFF1_ACCESS}" --data-binary @/tmp/nd-p3-collect.json "${API}/api/v1/parcels/${PARCEL_ID}/collect")"
echo "collect replay: HTTP ${B9}"
[[ "$B9" == "409" ]]
expect_json_code "QR_NOT_READY"

echo "-- 3.10 GET collection-qr after collected (expect 409)"
E4="$(code_qr -b /tmp/nd-p3-cust.txt "${API}/api/v1/parcels/${PARCEL_ID}/collection-qr")"
echo "collection-qr after collected: HTTP ${E4}"
[[ "$E4" == "409" ]]
cp /tmp/nd-p3-qr-body.txt /tmp/nd-p3-body.txt
expect_json_code "QR_NOT_READY"

echo "== Phase 3 smoke: ALL OK"
