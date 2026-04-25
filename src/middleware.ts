import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const ACCESS_TOKEN_COOKIE = 'ma_access_token';
const PROTECTED_PREFIXES = ['/profile', '/settings', '/history'];
const ADMIN_PREFIX = '/admin';

function decodeJwtPayload(token: string): { exp?: number; role?: string } | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized)) as { exp?: number; role?: string };
  } catch {
    return null;
  }
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/auth/login';
  url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix)) || path.startsWith(ADMIN_PREFIX);
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return redirectToLogin(request);

  const payload = decodeJwtPayload(token);
  const isExpired = payload?.exp ? payload.exp * 1000 <= Date.now() : true;
  if (!payload || isExpired) {
    const response = redirectToLogin(request);
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    return response;
  }

  if (path.startsWith(ADMIN_PREFIX) && payload.role !== 'ADMIN') {
    const url = request.nextUrl.clone();
    url.pathname = '/profile';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/settings/:path*', '/history/:path*', '/admin/:path*'],
};
