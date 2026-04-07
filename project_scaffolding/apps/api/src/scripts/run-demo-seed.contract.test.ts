import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('run-demo-seed CLI contract', () => {
  it('exposes seed:demo in package scripts', () => {
    const pkgPath = path.join(__dirname, '../../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { scripts: Record<string, string> };
    expect(pkg.scripts['seed:demo']).toContain('run-demo-seed');
  });
});
