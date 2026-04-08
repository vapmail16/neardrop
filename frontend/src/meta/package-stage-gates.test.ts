/**
 * Contract: explicit stage gates on @neardrop/web (lint → typecheck → test → build)
 * and a `clean` script for corrupted `.next` / EMFILE recovery (see MASTER_CHECKLIST / NEARDROP plan §10).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('@neardrop/web package.json stage gates', () => {
  it('defines clean (.next) and verify (lint, typecheck, test, build)', () => {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { scripts: Record<string, string> };
    expect(pkg.scripts.clean).toBeDefined();
    expect(pkg.scripts.clean).toMatch(/\.next/);
    const v = pkg.scripts.verify;
    expect(v).toBeDefined();
    expect(v).toMatch(/lint/);
    expect(v).toMatch(/typecheck/);
    expect(v).toMatch(/test/);
    expect(v).toMatch(/build/);
    expect(v).not.toMatch(/e2e/i);
  });

  it('defines test:file (scoped vitest) and verify:release (lint, typecheck, build, e2e — run after backend verify:release)', () => {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { scripts: Record<string, string> };
    expect(pkg.scripts['test:file']).toBeDefined();
    expect(pkg.scripts['test:file']).toMatch(/vitest\s+run/);
    const r = pkg.scripts['verify:release'];
    expect(r).toBeDefined();
    expect(r).toMatch(/lint/);
    expect(r).toMatch(/typecheck/);
    expect(r).toMatch(/build/);
    expect(r).toMatch(/test:e2e/);
    expect(r).not.toMatch(/\bvitest\b/);
  });
});
