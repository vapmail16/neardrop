/**
 * Phase 4 — strict TDD: written before `carrier-route-gate.ts`.
 * @vitest-environment node
 */
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { applyCarrierRouteGate } from './carrier-route-gate';

describe('applyCarrierRouteGate', () => {
  it('passes through when path does not start with /carrier', () => {
    const req = new NextRequest(new URL('http://localhost:3020/login'));
    const res = applyCarrierRouteGate(req);
    expect(res.status).toBe(200);
  });

  it('redirects to login with returnTo when nd_access cookie is missing', () => {
    const req = new NextRequest(new URL('http://localhost:3020/carrier/dashboard'));
    const res = applyCarrierRouteGate(req);
    expect(res.status).toBe(307);
    const loc = res.headers.get('location');
    expect(loc).toBeTruthy();
    expect(loc).toMatch(/\/login/);
    expect(loc).toContain('returnTo=');
    expect(decodeURIComponent(loc!)).toContain('/carrier/dashboard');
  });

  it('includes query string in returnTo', () => {
    const req = new NextRequest(new URL('http://localhost:3020/carrier/parcels?page=2'));
    const res = applyCarrierRouteGate(req);
    const loc = res.headers.get('location')!;
    expect(decodeURIComponent(loc)).toContain('/carrier/parcels?page=2');
  });

  it('continues when nd_access is present and sets x-nd-pathname on forwarded request', () => {
    const req = new NextRequest(new URL('http://localhost:3020/carrier/manifests'), {
      headers: { cookie: 'nd_access=tok' },
    });
    const res = applyCarrierRouteGate(req);
    expect(res.status).toBe(200);
  });
});
