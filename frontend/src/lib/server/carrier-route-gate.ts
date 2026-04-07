import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/** Cookie + header gate for `/carrier/*` (Edge middleware delegates here for unit testing). */
export function applyCarrierRouteGate(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  if (!pathname.startsWith('/carrier')) {
    return NextResponse.next();
  }

  const access = request.cookies.get('nd_access');
  if (!access?.value) {
    const login = new URL('/login', request.url);
    login.searchParams.set('returnTo', pathname + search);
    return NextResponse.redirect(login);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nd-pathname', pathname + search);
  return NextResponse.next({ request: { headers: requestHeaders } });
}
