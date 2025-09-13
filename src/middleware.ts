import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in"],
  ignoredRoutes: ["/api/webhooks/(.*)", "/api/health", "/api/payments/packages", "/api/payments/webhook", "/api/referrals/validate", "/api/cards", "/api/dev/set-admin", "/api/debug-auth", "/api/admin/force-session-refresh"]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};