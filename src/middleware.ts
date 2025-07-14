import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in"],
  ignoredRoutes: ["/api/webhooks/(.*)", "/api/health", "/api/payments/packages", "/api/payments/webhook"]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};