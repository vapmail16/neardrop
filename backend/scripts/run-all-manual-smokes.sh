#!/usr/bin/env bash
# Runs Phase 1, 2, and 3 curl smokes in order against the same API_BASE.
# Prerequisites: API listening; PostgreSQL for phases 2–3.
# Usage: bash backend/scripts/run-all-manual-smokes.sh [API_BASE]
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
API="${1:-http://127.0.0.1:3010}"
bash "${REPO_ROOT}/backend/scripts/manual-test-phase1-smoke.sh" "$API"
bash "${REPO_ROOT}/backend/scripts/manual-test-phase2-smoke.sh" "$API"
bash "${REPO_ROOT}/backend/scripts/manual-test-phase3-smoke.sh" "$API"
echo "== ALL manual smokes OK (Phase 1 + 2 + 3)"
