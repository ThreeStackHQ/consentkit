import { NextRequest, NextResponse } from "next/server";
import { db } from "@consentkit/db";
import { domains } from "@consentkit/db";
import { eq } from "drizzle-orm";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
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
