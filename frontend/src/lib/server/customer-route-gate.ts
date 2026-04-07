import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/** Cookie + header gate for `/customer/*` (mirrors carrier-route-gate; unit-tested in isolation). */
export function applyCustomerRouteGate(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  if (!pathname.startsWith('/customer')) {
    return NextResponse.next();
  }

  /** Public onboarding (must stay outside cookie gate). */
  if (pathname === '/customer/register') {
    return NextResponse.next();
  }

  const access = request.cookies.get('nd_access');
  if (!access?.value) {
    const login = new URL('/login', request.url);
    login.searchParams.set('returnTo', pathname + search);
    login.searchParams.set('portal', 'customer');
    return NextResponse.redirect(login);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nd-pathname', pathname + search);
  return NextResponse.next({ request: { headers: requestHeaders } });
}
