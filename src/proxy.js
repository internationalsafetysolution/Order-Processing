import { NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'company_session';

export function proxy(request) {
  const { pathname } = request.nextUrl;
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

  // 1. Not logged in -> redirect to /login for protected routes
  if (!user) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/staff')) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    // Accessing root / -> redirect to login
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // 2. Logged in -> handle routing rules
  if (user) {
    // If accessing root / -> redirect to appropriate portal
    if (pathname === '/') {
      const target = user.role === 'ADMIN' ? '/admin' : '/staff';
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Accessing login while logged in -> redirect to portal
    if (pathname.startsWith('/login')) {
      const target = user.role === 'ADMIN' ? '/admin' : '/staff';
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Accessing Admin routes as Staff
    if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
      // Allow access to order processing, order types, and clients paths (granularly checked in page layouts and APIs)
      if (pathname.startsWith('/admin/orders') || pathname.startsWith('/admin/clients')) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/staff', request.url));
    }

    // Accessing Staff routes as Admin -> redirect to admin
    if (pathname.startsWith('/staff') && user.role !== 'STAFF') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/staff/:path*'],
};
