import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const feedbackToken = request.cookies.get('feedback-token');
  const adminSession = request.cookies.get('admin-session');

  // Protect feedback page
  if (pathname === '/feedback' && !feedbackToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect admin pages
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !adminSession) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Redirect logged in admin from login page to dashboard
  if (pathname === '/admin/login' && adminSession) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
 
  return NextResponse.next();
}
 
export const config = {
  matcher: ['/feedback', '/admin/:path*'],
}
