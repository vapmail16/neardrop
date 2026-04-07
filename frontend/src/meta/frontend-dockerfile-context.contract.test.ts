import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * DCDeploy uses build context ./frontend — Dockerfile COPY paths must be relative to that root,
 * not `COPY frontend/...` (repo-root layout).
 */
describe('frontend/Dockerfile (DCDeploy context)', () => {
  it('does not use monorepo-root COPY paths', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const dockerfile = readFileSync(path.join(dir, '..', '..', 'Dockerfile'), 'utf8');
    expect(dockerfile).not.toMatch(/COPY\s+frontend\//);
    expect(dockerfile).not.toMatch(/COPY\s+backend\//);
  });
});
