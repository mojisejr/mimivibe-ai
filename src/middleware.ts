import { authMiddleware } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/en", "/en/sign-in", "/en/ask", "/en/history", "/en/packages", "/en/payments", "/en/exchange", "/en/profile", "/en/meamor"],
  ignoredRoutes: ["/api/webhooks/(.*)", "/api/health", "/api/payments/packages", "/api/payments/webhook", "/api/referrals/validate", "/api/cards", "/api/dev/set-admin", "/api/debug-auth", "/api/admin/force-session-refresh", "/api/readings/process", "/api/readings/test-async", "/api/readings/test-status/(.*)"],

  beforeAuth(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    // Skip middleware for API routes, static files, and _next
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.includes('.') ||
      pathname.startsWith('/favicon')
    ) {
      return;
    }

    // Handle English locale routing
    if (pathname.startsWith('/en/')) {
      // Remove /en prefix and rewrite to the actual page with locale parameter
      const pathWithoutLocale = pathname.replace('/en', '') || '/';
      const newUrl = new URL(pathWithoutLocale + search, req.url);
      newUrl.searchParams.set('locale', 'en');

      return NextResponse.rewrite(newUrl);
    }

    // For Thai (default locale), add locale parameter
    if (!pathname.startsWith('/en/')) {
      const newUrl = new URL(pathname + search, req.url);
      newUrl.searchParams.set('locale', 'th');

      return NextResponse.rewrite(newUrl);
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};