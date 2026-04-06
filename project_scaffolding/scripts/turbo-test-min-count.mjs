#!/usr/bin/env node
/**
 * Phase 8 plan exit gate: `npm run test` across workspaces must report ≥ MIN passed Vitest tests.
 * Parses `turbo run test --force` output (matches `@neardrop/*:test:` summary lines).
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MIN_TOTAL = 200;
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const res = spawnSync('npx', ['turbo', 'run', 'test', '--force'], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024,
  shell: process.platform === 'win32',
});

const text = `${res.stdout ?? ''}\n${res.stderr ?? ''}`;
const re = /@neardrop\/[^:]+:test:\s+Tests\s+(\d+)\s+passed/g;
let sum = 0;
for (const m of text.matchAll(re)) {
  sum += Number(m[1]);
}

if (res.status !== 0 && res.status !== null) {
  process.stderr.write(text.slice(-8000));
  process.exit(res.status);
}

if (sum < MIN_TOTAL) {
  console.error(
    `Phase 8 gate: Vitest total ${sum} < ${MIN_TOTAL}. Expected >= ${MIN_TOTAL} passed tests across @neardrop/* (turbo).`,
  );
  process.exit(1);
}

console.log(`Phase 8 gate: Vitest monorepo total ${sum} (>= ${MIN_TOTAL}).`);
process.exit(0);
