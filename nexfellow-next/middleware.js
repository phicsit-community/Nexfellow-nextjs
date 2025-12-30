import { NextResponse } from "next/server";

// Routes that require authentication
const PRIVATE_ROUTES = [
    "/feed",
    "/dashboard",
    "/explore",
    "/communities",
    "/community",
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
];

// Routes that should redirect logged-in users
const AUTH_ROUTES = ["/login", "/signup", "/forgotpassword"];

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Check for auth cookie/token
    const isLoggedIn = request.cookies.get("isLoggedIn")?.value === "true";

    // Check if current path is a private route
    const isPrivateRoute = PRIVATE_ROUTES.some((route) =>
        pathname.startsWith(route)
    );

    // Check if current path is an auth route
    const isAuthRoute = AUTH_ROUTES.some((route) =>
        pathname.startsWith(route)
    );

    // Redirect to login if accessing private route without auth
    if (isPrivateRoute && !isLoggedIn) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect to feed if accessing auth routes while logged in
    if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL("/feed", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.[^/]+$).*)",
    ],
};
