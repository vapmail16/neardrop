import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('next.config (DCDeploy / Docker)', () => {
  it('uses standalone output and monorepo tracing root', async () => {
    const mod = await import('../../next.config.mjs');
    const cfg = mod.default as {
      output?: string;
      experimental?: { outputFileTracingRoot?: string };
    };
    const repoRoot = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '..',
      '..',
      '..',
    );
    expect(cfg.output).toBe('standalone');
    expect(cfg.experimental?.outputFileTracingRoot).toBe(repoRoot);
  });
});
