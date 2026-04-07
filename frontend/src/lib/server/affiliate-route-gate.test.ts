/**
 * Phase 6 — affiliate middleware gate (TDD).
 * @vitest-environment node
 */
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { applyAffiliateRouteGate } from './affiliate-route-gate';

describe('applyAffiliateRouteGate', () => {
  it('passes through when path does not start with /affiliate', () => {
    const req = new NextRequest(new URL('http://localhost:3020/login'));
    const res = applyAffiliateRouteGate(req);
    expect(res.status).toBe(200);
  });

  it('allows /affiliate/register without cookie', () => {
    const req = new NextRequest(new URL('http://localhost:3020/affiliate/register'));
    const res = applyAffiliateRouteGate(req);
    expect(res.status).toBe(200);
  });

  it('redirects to login with portal=affiliate when cookie missing', () => {
    const req = new NextRequest(new URL('http://localhost:3020/affiliate/dashboard'));
    const res = applyAffiliateRouteGate(req);
    expect(res.status).toBe(307);
    const loc = res.headers.get('location')!;
    expect(loc).toMatch(/\/login/);
    expect(loc).toContain('portal=affiliate');
    expect(decodeURIComponent(loc)).toContain('/affiliate/dashboard');
  });

  it('continues when nd_access is present', () => {
    const req = new NextRequest(new URL('http://localhost:3020/affiliate/parcels'), {
      headers: { cookie: 'nd_access=tok' },
    });
    const res = applyAffiliateRouteGate(req);
    expect(res.status).toBe(200);
  });
});
