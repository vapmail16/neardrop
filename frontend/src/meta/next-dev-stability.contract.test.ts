/**
 * Contract: dev-time EMFILE / Watchpack failures on macOS can leave the App Router without compiled
 * pages → generic 404 on `/` and `/login`. Mitigations are encoded here (MASTER_CHECKLIST: reproducible dev).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('next.config.mjs dev webpack watchOptions', () => {
  it('uses polling and ignores heavy trees to reduce open file descriptors', () => {
    const raw = readFileSync(path.join(process.cwd(), 'next.config.mjs'), 'utf8');
    expect(raw).toMatch(/if\s*\(\s*dev\s*\)/);
    expect(raw).toMatch(/watchOptions/);
    expect(raw).toMatch(/poll:\s*1000/);
    expect(raw).toMatch(/aggregateTimeout:\s*300/);
    for (const glob of [
      '**/node_modules/**',
      '**/.git/**',
      '**/.next/**',
      '**/playwright/**',
      '**/test-results/**',
    ]) {
      expect(raw).toContain(glob);
    }
  });
});

describe('@neardrop/web package.json dev script', () => {
  it('attempts higher fd limit before next dev on Unix (ulimit)', () => {
    const pkg = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };
    const dev = pkg.scripts.dev;
    expect(dev).toBeDefined();
    expect(dev).toMatch(/next dev -p 3020/);
    if (process.platform === 'win32') {
      expect(dev).toMatch(/next dev/);
      return;
    }
    expect(dev).toMatch(/ulimit -n 10240/);
    expect(dev).toMatch(/exec next dev/);
  });
});
