import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of protected routes that require authentication
const protectedRoutes = [
    '/users',
    '/blogs',
    '/notifications',
    '/analytics',
    '/posts',
    '/requests',
    '/advertisements',
    '/featured-communities',
    '/referrals',
    '/checkout-details',
    '/quiz',
    '/challenges',
    '/rewards',
];

// List of public routes that don't require authentication
const publicRoutes = ['/login'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the route is protected
    const isProtectedRoute = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    // Check if the route is public
    const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    // Get token from cookies (if using cookie-based auth)
    const token = request.cookies.get('token')?.value;

    // Note: For localStorage-based auth, we handle this in the AuthGuard component
    // This middleware is primarily for cookie-based authentication
    // and for adding security headers

    // If using cookie-based auth and no token, redirect to login
    // Uncomment the following if using cookie-based authentication:
    /*
    if (isProtectedRoute && !token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  
    if (isPublicRoute && token) {
      return NextResponse.redirect(new URL('/users', request.url));
    }
    */

    // Add security headers
    const response = NextResponse.next();

    // Security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
    ],
};
