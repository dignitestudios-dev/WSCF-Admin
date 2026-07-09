import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Define authentication routes
  const authRoutes = ['/login', '/forgot-password', '/reset-password', '/verify-otp'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If the user has a token and tries to access login or auth routes, redirect them to dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If the user does not have a token and tries to access a protected route, redirect to login
  if (!token && !isAuthRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user does not have a token and accesses '/', redirect to login as well
  if (!token && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // // If the user has a token and accesses '/', redirect to dashboard
  // if (token && pathname === '/') {
  //   return NextResponse.redirect(new URL('/', request.url));
  // }

  return NextResponse.next();
}

// Config to apply middleware to specific routes (excluding API, static files, and images)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
