import { NextResponse } from "next/server";

// Routes that require authentication
const PRIVATE_ROUTES = [
    "/feed",
    "/dashboard",
    "/explore",
    "/communities",
    // "/community" - removed to allow public community preview
    "/leaderboard",
    "/inbox",
    "/notifications",
    "/settings",
    "/post",
    "/user",
    "/challenge",
    "/contest",
    "/create",
    "/admin",
    "/communication",
    "/edit-profile",
    "/verification",
    "/other",
    "/search",
    "/coming-soon",
    "/start-contest",
    "/contest-completed",
    "/contest-question",
    "/moderators",
    "/onboarding",
];

// Routes that should redirect logged-in users
const AUTH_ROUTES = ["/login", "/signup", "/forgotpassword"];

export function middleware(request) {
    const { pathname, searchParams } = request.nextUrl;

    // Check for auth cookie/token
    const isLoggedIn = request.cookies.get("isLoggedIn")?.value === "true";

    // Check for OAuth redirect indicator (backend might set this)
    const hasAuthToken = request.cookies.get("token")?.value ||
        request.cookies.get("accessToken")?.value ||
        request.cookies.get("connect.sid")?.value;

    // Check if current path is a private route
    const isPrivateRoute = PRIVATE_ROUTES.some((route) =>
        pathname.startsWith(route)
    );

    // Check if current path is an auth route
    const isAuthRoute = AUTH_ROUTES.some((route) =>
        pathname.startsWith(route)
    );

    // For private routes: Allow access if either:
    // 1. isLoggedIn cookie is set, OR
    // 2. There's an auth token (OAuth flow might not have set isLoggedIn yet)
    // The page component will do the final auth check
    if (isPrivateRoute && !isLoggedIn && !hasAuthToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect logged-in but non-onboarded users to onboarding
    const isOnboarded = request.cookies.get("isOnboarded")?.value;
    if (isLoggedIn && isOnboarded === "false" && !pathname.startsWith("/onboarding")) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // Note: Removed auto-redirect from auth routes to feed
    // This was causing infinite loops. Login/Signup pages handle their own redirects.

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
