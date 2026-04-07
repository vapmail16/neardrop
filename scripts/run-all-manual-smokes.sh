#!/usr/bin/env bash
# Runs Phase 1, 2, and 3 curl smokes in order against the same API_BASE.
# Prerequisites: API listening; PostgreSQL for phases 2–3.
# Usage: bash scripts/run-all-manual-smokes.sh [API_BASE]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="${1:-http://127.0.0.1:3010}"
bash "${ROOT}/scripts/manual-test-phase1-smoke.sh" "$API"
bash "${ROOT}/scripts/manual-test-phase2-smoke.sh" "$API"
bash "${ROOT}/scripts/manual-test-phase3-smoke.sh" "$API"
echo "== ALL manual smokes OK (Phase 1 + 2 + 3)"
