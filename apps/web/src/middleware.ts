export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/domains/:path*",
    "/consent-logs/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/billing/:path*",
    "/api/((?!auth|widget|stripe|cron).*)",
  ],
};
