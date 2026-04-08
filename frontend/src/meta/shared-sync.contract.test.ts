import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { syncSharedDirs } from '../../scripts/sync-shared.mjs';

describe('shared sync script contract', () => {
  it('package.json exposes sync:shared script', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const pkgPath = path.join(dir, '..', '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    expect(pkg.scripts['sync:shared']).toBe('node scripts/sync-shared.mjs');
  });

  it('copies changed files and removes stale files', () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'nd-sync-shared-'));
    const source = path.join(root, 'source');
    const target = path.join(root, 'target');
    mkdirSync(path.join(source, 'src'), { recursive: true });
    mkdirSync(path.join(target, 'src'), { recursive: true });

    writeFileSync(path.join(source, 'package.json'), '{"name":"@neardrop/shared"}\n');
    writeFileSync(path.join(source, 'src', 'index.ts'), 'export const x = 1;\n');
    writeFileSync(path.join(target, 'src', 'index.ts'), 'export const x = 0;\n');
    writeFileSync(path.join(target, 'src', 'stale.ts'), 'stale\n');

    const result = syncSharedDirs(source, target);

    expect(result.copied).toContain('src/index.ts');
    expect(result.removed).toContain('src/stale.ts');
    expect(readFileSync(path.join(target, 'src', 'index.ts'), 'utf8')).toBe('export const x = 1;\n');

    rmSync(root, { recursive: true, force: true });
  });
});
