#!/usr/bin/env node
/**
 * Phase 8 plan exit gate: Vitest `npm run test` in backend (incl. shared) + frontend
 * must report ≥ MIN_TOTAL passed tests (parses Vitest summary lines).
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MIN_TOTAL = 200;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');

function vitestPassedSummary(text) {
  const re = /Tests\s+(\d+)\s+passed/g;
  let sum = 0;
  for (const m of text.matchAll(re)) {
    sum += Number(m[1]);
  }
  return sum;
}

function runNpmTest(cwd, label) {
  const res = spawnSync('npm', ['run', 'test'], {
    cwd,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    shell: process.platform === 'win32',
  });
  const text = `${res.stdout ?? ''}\n${res.stderr ?? ''}`;
  const passed = vitestPassedSummary(text);
  if (res.status !== 0 && res.status !== null) {
    process.stderr.write(
      `${label}: npm run test failed (exit ${res.status})\n${text.slice(-8000)}`,
    );
    process.exit(res.status ?? 1);
  }
  return passed;
}

const backendPassed = runNpmTest(path.join(repoRoot, 'backend'), 'backend');
const frontendPassed = runNpmTest(path.join(repoRoot, 'frontend'), 'frontend');
const sum = backendPassed + frontendPassed;

if (sum < MIN_TOTAL) {
  console.error(
    `Phase 8 gate: Vitest total ${sum} < ${MIN_TOTAL}. Expected >= ${MIN_TOTAL} passed tests (backend+frontend Vitest).`,
  );
  process.exit(1);
}

console.log(`Phase 8 gate: Vitest total ${sum} (>= ${MIN_TOTAL}).`);
process.exit(0);
