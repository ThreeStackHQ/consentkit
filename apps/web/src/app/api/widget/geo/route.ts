import { NextRequest, NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// EU member states + EEA
const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
  // EEA
  "IS", "LI", "NO",
  // UK (post-Brexit, kept similar rules)
  "GB",
]);

// Countries with CCPA/PIPEDA-style requirements
const CONSENT_COUNTRIES = new Set([...EU_COUNTRIES, "CA"]);

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export function GET(req: NextRequest) {
  // Cloudflare provides CF-IPCountry header
  const country =
    req.headers.get("cf-ipcountry") ??
    req.headers.get("x-vercel-ip-country") ??
    "US";

  const requiresConsent = CONSENT_COUNTRIES.has(country.toUpperCase());

  return NextResponse.json(
    {
      country: country.toUpperCase(),
      requiresConsent,
      isEU: EU_COUNTRIES.has(country.toUpperCase()),
    },
    { headers: CORS_HEADERS },
  );
}
