export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    // Core dashboard route
    "/dashboard/:path*",
    // Wren UI routes (route group pages at root level)
    "/domains/:path*",
    "/consent-logs/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/billing/:path*",
    // Protected API routes — exclude public endpoints
    "/api/((?!auth|widget|stripe|cron).*)",
  ],
};
