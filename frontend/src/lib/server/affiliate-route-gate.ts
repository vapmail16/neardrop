import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/** Cookie gate for `/affiliate/*` (except public register). */
export function applyAffiliateRouteGate(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  if (!pathname.startsWith('/affiliate')) {
    return NextResponse.next();
  }

  if (pathname === '/affiliate/register') {
    return NextResponse.next();
  }

  const access = request.cookies.get('nd_access');
  if (!access?.value) {
    const login = new URL('/login', request.url);
    login.searchParams.set('returnTo', pathname + search);
    login.searchParams.set('portal', 'affiliate');
    return NextResponse.redirect(login);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nd-pathname', pathname + search);
  return NextResponse.next({ request: { headers: requestHeaders } });
}
