import { NextRequest, NextResponse } from "next/server";
import { db } from "@consentkit/db";
import { domains } from "@consentkit/db";
import { eq } from "drizzle-orm";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// SEC-001 FIX: Rate limit /api/widget/config to prevent API key brute-force
// 30 req/min per IP; in-memory sliding window (stateless serverless: acceptable for first-line defence)
const configRateLimiter = new Map<string, number[]>();

function isConfigRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 30;

  const timestamps = (configRateLimiter.get(ip) ?? []).filter(
    (t) => now - t < windowMs,
  );

  if (timestamps.length >= maxRequests) return true;

  timestamps.push(now);
  configRateLimiter.set(ip, timestamps);
  return false;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  // SEC-001 FIX: prefer cf-connecting-ip (Cloudflare-set, not client-spoofable)
  const ip =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (isConfigRateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: CORS_HEADERS },
    );
  }

  const key = req.nextUrl.searchParams.get("key");

  if (!key || !key.startsWith("ck_live_")) {
    return NextResponse.json(
      { error: "Invalid API key" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const domain = await db.query.domains.findFirst({
    where: eq(domains.apiKey, key),
  });

  if (!domain || !domain.isActive) {
    return NextResponse.json(
      { error: "Domain not found" },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  const categories: string[] = ["necessary"];
  if (domain.analyticsEnabled) categories.push("analytics");
  if (domain.marketingEnabled) categories.push("marketing");
  if (domain.preferencesEnabled) categories.push("preferences");

  return NextResponse.json(
    {
      domainId: domain.id,
      bannerTitle: domain.bannerTitle,
      bannerDescription: domain.bannerDescription,
      theme: domain.theme,
      position: domain.position,
      categories,
      showForEU: domain.showForEU,
      showForUK: domain.showForUK,
      showForCA: domain.showForCA,
    },
    {
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}
