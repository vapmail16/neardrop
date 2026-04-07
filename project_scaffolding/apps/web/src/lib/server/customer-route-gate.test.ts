/**
 * Phase 5 — customer middleware gate (TDD).
 * @vitest-environment node
 */
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { applyCustomerRouteGate } from './customer-route-gate';

describe('applyCustomerRouteGate', () => {
  it('passes through when path does not start with /customer', () => {
    const req = new NextRequest(new URL('http://localhost:3020/login'));
    const res = applyCustomerRouteGate(req);
    expect(res.status).toBe(200);
  });

  it('allows /customer/register without cookie', () => {
    const req = new NextRequest(new URL('http://localhost:3020/customer/register'));
    const res = applyCustomerRouteGate(req);
    expect(res.status).toBe(200);
  });

  it('redirects to login with portal=customer when cookie missing', () => {
    const req = new NextRequest(new URL('http://localhost:3020/customer/dashboard'));
    const res = applyCustomerRouteGate(req);
    expect(res.status).toBe(307);
    const loc = res.headers.get('location')!;
    expect(loc).toMatch(/\/login/);
    expect(loc).toContain('portal=customer');
    expect(decodeURIComponent(loc)).toContain('/customer/dashboard');
  });

  it('continues when nd_access is present', () => {
    const req = new NextRequest(new URL('http://localhost:3020/customer/parcels'), {
      headers: { cookie: 'nd_access=tok' },
    });
    const res = applyCustomerRouteGate(req);
    expect(res.status).toBe(200);
  });
});
