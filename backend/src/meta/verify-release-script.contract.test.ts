import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('backend verify:release script', () => {
  it('chains lint, typecheck, migrate, integration, and phase8 count gate (includes frontend vitest)', () => {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { scripts: Record<string, string> };
    const s = pkg.scripts['verify:release'];
    expect(s).toBeDefined();
    expect(s).toMatch(/lint/);
    expect(s).toMatch(/typecheck/);
    expect(s).toMatch(/migrate/);
    expect(s).toMatch(/test:integration/);
    expect(s).toMatch(/test:phase8-count-gate/);
  });
});
