import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login(.*)",
  "/signup(.*)",
  "/forgotpassword(.*)",
  "/auth/callback(.*)",
  "/features(.*)",
  "/mission(.*)",
  "/blogs(.*)",
  "/launches(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/help(.*)",
  "/contact(.*)",
  "/link/(.*)",
  "/api/webhooks(.*)",
  "/preview(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // After Clerk confirms the user is signed in, check onboarding status via cookie.
  // The isOnboarded cookie is set by ClientInitializer after fetching /auth/getDetails.
  const { userId } = await auth();
  if (userId) {
    const isOnboarded = req.cookies.get("isOnboarded")?.value;
    if (
      isOnboarded === "false" &&
      !pathname.startsWith("/onboarding") &&
      !pathname.startsWith("/sign-in") &&
      !pathname.startsWith("/sign-up") &&
      !pathname.startsWith("/api/webhooks")
    ) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf)).*)",
    "/(api|trpc)(.*)",
  ],
};
