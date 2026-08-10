import { NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'company_session';

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Skip static assets, internal next files, and media
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  // Parse session if it exists
  let user = null;
  if (sessionCookie && sessionCookie.value) {
    try {
      const decoded = Buffer.from(sessionCookie.value, 'base64').toString('ascii');
      user = JSON.parse(decoded);
    } catch (e) {
      console.error('Proxy cookie parse failed:', e);
    }
  }

  let response;

  // 1. Not logged in -> redirect to /login for protected routes & root /
  if (!user) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/staff') || pathname === '/') {
      const loginUrl = new URL('/login', request.url);
      response = NextResponse.redirect(loginUrl, 307);
    } else {
      response = NextResponse.next();
    }
  } else {
    // 2. Logged in -> handle routing rules
    if (pathname === '/' || pathname.startsWith('/login')) {
      const target = user.role === 'ADMIN' ? '/admin' : '/staff';
      response = NextResponse.redirect(new URL(target, request.url), 307);
    } else if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
      if (pathname.startsWith('/admin/orders') || pathname.startsWith('/admin/clients')) {
        response = NextResponse.next();
      } else {
        response = NextResponse.redirect(new URL('/staff', request.url), 307);
      }
    } else if (pathname.startsWith('/staff') && user.role !== 'STAFF') {
      response = NextResponse.redirect(new URL('/admin', request.url), 307);
    } else {
      response = NextResponse.next();
    }
  }

  // Prevent mobile browsers from caching HTML navigation pages with stale CSS/JS chunk hashes
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/staff/:path*'],
};
