import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Next.js only loads proxy (formerly middleware) from next to the `app` directory —
// with `src/app`, that means `src/proxy.js`. This file used to live at the project
// root, where it was silently ignored, so nothing enforced onboarding.
//
// It intentionally does not call auth.protect(): logged-out visitors rely on
// view-only community pages and shared post/profile links, and pages guard
// themselves client-side.

// Signed-in users who haven't finished onboarding may only reach these
const ONBOARDING_EXEMPT = ["/onboarding", "/sign-in", "/sign-up", "/api/webhooks"];

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // The isOnboarded cookie is set by ClientInitializer after fetching /auth/getDetails.
  const { userId } = await auth();
  if (userId) {
    const isOnboarded = req.cookies.get("isOnboarded")?.value;
    if (
      isOnboarded === "false" &&
      !ONBOARDING_EXEMPT.some((prefix) => pathname.startsWith(prefix))
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
