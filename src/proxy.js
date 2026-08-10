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

  // 1. Not logged in -> redirect to /login for protected routes & root /
  if (!user) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/staff') || pathname === '/') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl, 307);
    }
    return NextResponse.next();
  }

  // 2. Logged in -> handle routing rules
  if (user) {
    // If accessing root / -> redirect to appropriate portal
    if (pathname === '/') {
      const target = user.role === 'ADMIN' ? '/admin' : '/staff';
      return NextResponse.redirect(new URL(target, request.url), 307);
    }

    // Accessing login while logged in -> redirect to portal
    if (pathname.startsWith('/login')) {
      const target = user.role === 'ADMIN' ? '/admin' : '/staff';
      return NextResponse.redirect(new URL(target, request.url), 307);
    }

    // Accessing Admin routes as Staff
    if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
      if (pathname.startsWith('/admin/orders') || pathname.startsWith('/admin/clients')) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/staff', request.url), 307);
    }

    // Accessing Staff routes as Admin -> redirect to admin
    if (pathname.startsWith('/staff') && user.role !== 'STAFF') {
      return NextResponse.redirect(new URL('/admin', request.url), 307);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
