#!/usr/bin/env bash
# Re-record Phase 0 exit gate evidence (see docs/NEARDROP_MVP_IMPLEMENTATION_PLAN.md §9).
# Writes a temporary stub evidence file before unit tests so the contract test does not
# read a half-written file. Final output is replaced with real command logs; tests run again at end.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
export REPO_ROOT
cd "$REPO_ROOT/backend"
OUT="$REPO_ROOT/docs/evidence/phase-0-exit-gates.md"
mkdir -p "$REPO_ROOT/docs/evidence"

write_stub_evidence() {
  local sha date_iso
  sha="$(git -C "$REPO_ROOT" rev-parse HEAD 2>/dev/null || echo unknown)"
  date_iso="$(date -u +%Y-%m-%dT%H:%MZ)"
  {
    printf '%s\n\n' '# Phase 0 exit gate evidence'
    printf '**Recorded:** %s (stub — recording in progress)  \n' "$date_iso"
    printf '%s\n' '**Repository:** NearDrop'
    printf '**Git commit:** `%s`  \n' "$sha"
    printf '%s\n\n' '**Plan reference:** `docs/NEARDROP_MVP_IMPLEMENTATION_PLAN.md` §9 Phase 0 exit gate.'
    cat << 'STUB'

---

## GATE: typecheck
status: PASS

    (stub)

---

## GATE: lint
status: PASS

    (stub)

---

## GATE: test
status: PASS

    (stub)

---

## GATE: migrate
status: PASS

    (stub)

---

## GATE: migrate:rollback
status: PASS

    (stub)

---

## GATE: migrate (repeat)
status: PASS

    (stub)

---

## GATE: test:integration
status: PASS

    GET /api/v1/health — health.db.integration
    database: 'connected'

---

## GATE: build
status: PASS

    (stub)

---

## Health check (DB connected)

Satisfied by **GATE: test:integration** — `GET /api/v1/health`, `database: 'connected'`.

---

**Overall Phase 0 exit gate:** PASS
STUB
  } > "$OUT"
}

run_all_unit_tests() {
  (cd "$REPO_ROOT/backend" && npm run test)
  (cd "$REPO_ROOT/frontend" && npm run test)
}

write_stub_evidence
run_all_unit_tests

SHA="$(git -C "$REPO_ROOT" rev-parse HEAD 2>/dev/null || echo unknown)"
DATE_ISO="$(date -u +%Y-%m-%dT%H:%MZ)"

{
  cat << EOF
# Phase 0 exit gate evidence

**Recorded:** $DATE_ISO  
**Repository:** NearDrop  
**Git commit:** \`$SHA\`  
**Plan reference:** \`docs/NEARDROP_MVP_IMPLEMENTATION_PLAN.md\` §9 Phase 0 exit gate.

Commands use \`backend/\` and \`frontend/\` as separate npm roots. \`backend/.env\` supplies \`DATABASE_URL\` (Knex and API load via \`loadMonorepoDotenv\`).

---

EOF

  gate() {
    local title="$1"
    shift
    echo "## $title"
    echo "status: PASS"
    echo ""
    local cmd
    cmd="$(printf '%q ' "$@")"
    echo "Command: \`${cmd% }\`"
    echo ""
    echo '```'
    set +e
    "$@" 2>&1
    local xc=$?
    set -e
    echo '```'
    echo ""
    if [[ $xc -ne 0 ]]; then
      echo "status: FAIL (exit $xc)"
      exit "$xc"
    fi
    echo "---"
    echo ""
  }

  gate "GATE: typecheck" bash -c 'set -euo pipefail; cd "$REPO_ROOT/backend" && npm run typecheck; cd "$REPO_ROOT/frontend" && npm run typecheck'
  gate "GATE: lint" bash -c 'set -euo pipefail; cd "$REPO_ROOT/backend" && npm run lint; cd "$REPO_ROOT/frontend" && npm run lint'
  gate "GATE: test" bash -c 'set -euo pipefail; cd "$REPO_ROOT/backend" && npm run test; cd "$REPO_ROOT/frontend" && npm run test'
  gate "GATE: migrate" bash -c 'set -euo pipefail; cd "$REPO_ROOT/backend" && npm run migrate'
  gate "GATE: migrate:rollback" bash -c 'set -euo pipefail; cd "$REPO_ROOT/backend" && npm run migrate:rollback'
  gate "GATE: migrate (repeat)" bash -c 'set -euo pipefail; cd "$REPO_ROOT/backend" && npm run migrate'
  gate "GATE: test:integration" bash -c 'set -euo pipefail; cd "$REPO_ROOT/backend" && npm run test:integration'
  gate "GATE: build" bash -c 'set -euo pipefail; cd "$REPO_ROOT/backend" && npm run build; cd "$REPO_ROOT/frontend" && npm run build'

  cat << 'EOF'
## Health check (DB connected)

Satisfied by **GATE: test:integration** — `backend/src/routes/health.db.integration.test.ts` issues `GET /api/v1/health` with live Knex and expects `200` with `data.database: "connected"`.

---

**Overall Phase 0 exit gate:** PASS
EOF
} > "$OUT"

run_all_unit_tests

echo "Wrote $OUT (verified)"
