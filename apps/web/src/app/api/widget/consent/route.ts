import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { db } from "@consentkit/db";
import { domains, consentLogs } from "@consentkit/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// In-memory sliding window rate limiter: 60 req/min per IP
const rateLimiter = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 60;

  const timestamps = (rateLimiter.get(ip) ?? []).filter(
    (t) => now - t < windowMs,
  );

  if (timestamps.length >= maxRequests) return true;

  timestamps.push(now);
  rateLimiter.set(ip, timestamps);
  return false;
}

const consentSchema = z.object({
  apiKey: z.string().startsWith("ck_live_"),
  visitorId: z.string().uuid(),
  action: z.enum(["accept", "reject", "partial"]),
  categories: z.object({
    necessary: z.boolean(),
    analytics: z.boolean(),
    marketing: z.boolean(),
    preferences: z.boolean(),
  }),
  countryCode: z.string().length(2).optional(),
});

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  // SEC-003 FIX: prefer cf-connecting-ip (Cloudflare-set, not client-spoofable)
  // x-forwarded-for can be appended by clients; cf-connecting-ip is authoritative
  const ip =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: CORS_HEADERS },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const parsed = consentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const { apiKey, visitorId, action, categories, countryCode } = parsed.data;

  const domain = await db.query.domains.findFirst({
    where: eq(domains.apiKey, apiKey),
  });

  if (!domain || !domain.isActive) {
    return NextResponse.json(
      { error: "Domain not found" },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  // Hash IP with domain api_key as salt (no PII stored)
  const ipHash = createHash("sha256")
    .update(ip + apiKey)
    .digest("hex");

  const logId = randomBytes(16).toString("hex");

  await db.insert(consentLogs).values({
    id: logId,
    domainId: domain.id,
    visitorId,
    action,
    categories,
    countryCode: countryCode ?? null,
    ipHash,
  });

  return NextResponse.json({ success: true }, { headers: CORS_HEADERS });
}
