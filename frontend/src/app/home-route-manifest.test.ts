/**
 * Contract: after `next build`, App Router must register `/` from `src/app/page.tsx`.
 * Skips when `.next` is absent (local `vitest` without a prior build).
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const manifestPath = path.join(process.cwd(), '.next/app-path-routes-manifest.json');

describe('home route (build manifest)', () => {
  it.skipIf(!existsSync(manifestPath))('maps /page to /', () => {
    const raw = readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(raw) as Record<string, string>;
    expect(manifest['/page']).toBe('/');
  });
});
