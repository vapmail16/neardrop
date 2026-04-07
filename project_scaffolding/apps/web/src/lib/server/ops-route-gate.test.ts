/**
 * Phase 7 — ops middleware gate.
 * @vitest-environment node
 */
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { applyOpsRouteGate } from './ops-route-gate';

describe('applyOpsRouteGate', () => {
  it('allows /carrier without cookie', () => {
    const req = new NextRequest(new URL('http://localhost/carrier/dashboard'));
    const res = applyOpsRouteGate(req);
    expect(res.status).toBe(200);
  });

  it('redirects /ops/dashboard without access cookie', () => {
    const req = new NextRequest(new URL('http://localhost:3020/ops/dashboard'));
    const res = applyOpsRouteGate(req);
    expect(res.status).toBe(307);
    const loc = res.headers.get('location');
    expect(loc).toContain('/login');
    expect(loc).toContain('portal=ops');
    expect(loc).toContain('returnTo');
  });

  it('allows /ops when nd_access present', () => {
    const req = new NextRequest(new URL('http://localhost:3020/ops/dashboard'), {
      headers: { cookie: 'nd_access=abc' },
    });
    const res = applyOpsRouteGate(req);
    expect(res.status).toBe(200);
  });
});
