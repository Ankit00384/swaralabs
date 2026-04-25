import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const WELCOME_HOST = (process.env.WELCOME_HOST ?? "welcome.swarlabs.com").toLowerCase();
const DASHBOARD_HOST = (process.env.DASHBOARD_HOST ?? "dashboard.swarlabs.com").toLowerCase();

const isPublicRoute = createRouteMatcher(["/", "/about(.*)", "/careers(.*)", "/sign-in(.*)", "/sign-up(.*)"]);

const isOrgSelectionRoute = createRouteMatcher(["/org-selection(.*)"]);

const isDashboardAppRoute = createRouteMatcher([
  "/app(.*)",
  "/voices(.*)",
  "/text-to-speech(.*)",
  "/speech-to-text(.*)",
  "/translate(.*)",
  "/text-extractor(.*)",
  "/sarvam-tools(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const hostname = req.nextUrl.hostname.toLowerCase();

  if (
    WELCOME_HOST !== DASHBOARD_HOST
    && hostname === WELCOME_HOST
    && isDashboardAppRoute(req)
  ) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.hostname = DASHBOARD_HOST;
    return NextResponse.redirect(dashboardUrl);
  }

  if (hostname === DASHBOARD_HOST && req.nextUrl.pathname === "/") {
    const dashboardHome = req.nextUrl.clone();
    dashboardHome.pathname = "/app";
    return NextResponse.redirect(dashboardHome);
  }

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const { userId, orgId } = await auth();

  // Protect non-public routes
  if (!userId) {
    await auth.protect();
  }

  // Allow org selection page
  if (isOrgSelectionRoute(req)) {
    return NextResponse.next();
  }

  // For all protected routes, ensure org is selected
  if (userId && !orgId) {
    const orgSelection = new URL("/org-selection", req.url);
    return NextResponse.redirect(orgSelection);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
