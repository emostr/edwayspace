import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const superadminToken = request.cookies.get('superadmin_token')?.value;
  const isSuperadminAuth = Boolean(superadminToken);

  if (pathname.startsWith('/superadmin/dashboard') && !isSuperadminAuth) {
    return NextResponse.redirect(new URL('/superadmin', request.url));
  }

  if (pathname === '/superadmin' && isSuperadminAuth) {
    return NextResponse.redirect(new URL('/superadmin/dashboard', request.url));
  }

  if (pathname.startsWith('/superadmin')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  const isAuthenticated = Boolean(token);

  if (pathname.startsWith('/dashboard') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
