#!/usr/bin/env bash
# Repeatable curl smoke for docs/MANUAL_TEST_PHASE_1.md section 2.
# Prerequisites: API running; JWT_SECRET in .env when hitting DB.
# Usage: bash scripts/manual-test-phase1-smoke.sh [API_BASE]
# Start API: cd backend && npm run dev
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"
API="${1:-http://127.0.0.1:3010}"
TS="$(date +%s)"
PW='GoodPassw0rd!'
# Valid UK shape (customer registration requires postcode per registerRequestSchema)
POSTCODE="$(printf 'B%02d %dTH' $(((TS + $$) % 100)) $(((TS + RANDOM) % 10)))"
EMAIL_CUST="manual-p1-cust-${TS}@example.com"
EMAIL_OPS="manual-p1-ops-${TS}@example.com"

echo "== Phase 1 smoke -> ${API} (ts=${TS})"

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

code() { curl -sS -o /tmp/nd-p1-body.txt -w '%{http_code}' "$@"; }

echo "-- 2.1 register customer"
H1="$(code -c /tmp/nd-p1-cust.txt -H 'Content-Type: application/json' -d "{\"email\":\"${EMAIL_CUST}\",\"password\":\"${PW}\",\"firstName\":\"T\",\"lastName\":\"U\",\"role\":\"customer\",\"postcode\":\"${POSTCODE}\"}" "${API}/api/v1/auth/register")"
echo "register: HTTP ${H1}"
[[ "$H1" == "200" ]]
node -e "const j=require('fs').readFileSync('/tmp/nd-p1-body.txt','utf8'); if(!JSON.parse(j).success) process.exit(1);"

echo "-- 2.2 GET /auth/me"
H2="$(code -b /tmp/nd-p1-cust.txt "${API}/api/v1/auth/me")"
echo "me: HTTP ${H2}"
[[ "$H2" == "200" ]]
node -e "const j=JSON.parse(require('fs').readFileSync('/tmp/nd-p1-body.txt','utf8')); const w='${EMAIL_CUST}'.toLowerCase(); if((j.data.user.email||'').toLowerCase()!==w) process.exit(1);"

echo "-- 2.3 ops-ping as customer (expect 403)"
H3="$(code -b /tmp/nd-p1-cust.txt -o /dev/null -w '%{http_code}' "${API}/api/v1/auth/ops-ping")"
echo "ops-ping: HTTP ${H3}"
[[ "$H3" == "403" ]]

echo "-- 2.4 refresh"
H4="$(code -b /tmp/nd-p1-cust.txt -X POST "${API}/api/v1/auth/refresh")"
echo "refresh: HTTP ${H4}"
[[ "$H4" == "200" ]]

echo "-- 2.5 logout"
H5="$(code -b /tmp/nd-p1-cust.txt -X POST "${API}/api/v1/auth/logout")"
echo "logout: HTTP ${H5}"
[[ "$H5" == "200" ]]

echo "-- 2.6 register ops + ops-ping 200"
H6="$(code -c /tmp/nd-p1-ops.txt -H 'Content-Type: application/json' -d "{\"email\":\"${EMAIL_OPS}\",\"password\":\"${PW}\",\"firstName\":\"O\",\"lastName\":\"P\",\"role\":\"ops\"}" "${API}/api/v1/auth/register")"
echo "register ops: HTTP ${H6}"
[[ "$H6" == "200" ]]
H7="$(code -b /tmp/nd-p1-ops.txt -o /dev/null -w '%{http_code}' "${API}/api/v1/auth/ops-ping")"
echo "ops-ping (ops): HTTP ${H7}"
[[ "$H7" == "200" ]]

echo "== Phase 1 smoke: ALL OK"
