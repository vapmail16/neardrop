import type { NextRequest } from 'next/server';
import { applyAffiliateRouteGate } from '@/lib/server/affiliate-route-gate';
import { applyCarrierRouteGate } from '@/lib/server/carrier-route-gate';
import { applyCustomerRouteGate } from '@/lib/server/customer-route-gate';
import { applyOpsRouteGate } from '@/lib/server/ops-route-gate';

export function middleware(request: NextRequest) {
  const opsRes = applyOpsRouteGate(request);
  if (opsRes.status >= 300 && opsRes.status < 400) {
    return opsRes;
  }
  const carrierRes = applyCarrierRouteGate(request);
  if (carrierRes.status >= 300 && carrierRes.status < 400) {
    return carrierRes;
  }
  const affiliateRes = applyAffiliateRouteGate(request);
  if (affiliateRes.status >= 300 && affiliateRes.status < 400) {
    return affiliateRes;
  }
  return applyCustomerRouteGate(request);
}

export const config = {
  matcher: ['/ops/:path*', '/carrier/:path*', '/affiliate/:path*', '/customer/:path*'],
};
