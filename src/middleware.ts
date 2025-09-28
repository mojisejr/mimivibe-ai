import { authMiddleware } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/en", "/en/sign-in", "/en/ask", "/en/history", "/en/packages", "/en/payments", "/en/exchange", "/en/profile", "/en/meamor"],
  ignoredRoutes: ["/api/webhooks/(.*)", "/api/health", "/api/payments/packages", "/api/payments/webhook", "/api/referrals/validate", "/api/cards", "/api/dev/set-admin", "/api/debug-auth", "/api/admin/force-session-refresh", "/api/readings/process", "/api/readings/test-async", "/api/readings/test-status/(.*)"],

  beforeAuth(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    // Skip middleware for static files and _next, but NOT for API routes that need auth
    if (
      pathname.startsWith('/_next/') ||
      pathname.includes('.') ||
      pathname.startsWith('/favicon')
    ) {
      return;
    }

    // Skip middleware only for API routes that are in ignoredRoutes
    if (pathname.startsWith('/api/')) {
      const ignoredRoutes = ["/api/webhooks/(.*)", "/api/health", "/api/payments/packages", "/api/payments/webhook", "/api/referrals/validate", "/api/cards", "/api/dev/set-admin", "/api/debug-auth", "/api/admin/force-session-refresh", "/api/readings/process", "/api/readings/test-async", "/api/readings/test-status/(.*)"];
      
      const isIgnored = ignoredRoutes.some(route => {
        if (route.includes('(.*)')) {
          const baseRoute = route.replace('(.*)', '');
          return pathname.startsWith(baseRoute);
        }
        return pathname === route;
      });
      
      if (isIgnored) {
        return;
      }
      // For non-ignored API routes, let Clerk middleware handle authentication
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