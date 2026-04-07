import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/** Monorepo root (packages/shared/src → ../../../). */
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const evidencePath = join(repoRoot, 'docs', 'evidence', 'phase-0-exit-gates.md');

function sectionHasPass(text: string, gateHeading: string): boolean {
  const esc = gateHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `^##\\s*${esc}\\s*\\nstatus:\\s*PASS\\b`,
    'm',
  );
  return re.test(text);
}

/**
 * Guards the Phase 0 exit gate evidence required by `docs/NEARDROP_MVP_IMPLEMENTATION_PLAN.md` §9.
 * Refresh with `scripts/record-phase-gates.sh` (uses a stub file during the first test pass).
 */
describe('Phase 0 evidence document', () => {
  it('has record-phase-gates.sh at repo root', () => {
    expect(
      existsSync(join(repoRoot, 'scripts', 'record-phase-gates.sh')),
    ).toBe(true);
  });

  it('exists and marks every required gate PASS', () => {
    expect(
      existsSync(evidencePath),
      `Expected evidence at ${evidencePath} — run scripts/record-phase-gates.sh`,
    ).toBe(true);

    const text = readFileSync(evidencePath, 'utf8');
    expect(text).toMatch(/phase\s*0\s+exit\s+gate\s+evidence/i);

    const gates = [
      'GATE: typecheck',
      'GATE: lint',
      'GATE: test',
      'GATE: migrate',
      'GATE: migrate:rollback',
      'GATE: migrate (repeat)',
      'GATE: test:integration',
      'GATE: build',
    ] as const;

    for (const g of gates) {
      expect(
        sectionHasPass(text, g),
        `Missing or failed section: ## ${g} with status: PASS immediately after heading`,
      ).toBe(true);
    }

    expect(text).toMatch(
      /health\.db\.integration|GET \/api\/v1\/health|database:\s*['"]connected['"]/i,
    );

    expect(text).toMatch(
      /\*{0,2}Overall Phase 0 exit gate:\*{0,2}\s*PASS\b/i,
    );
  });
});
