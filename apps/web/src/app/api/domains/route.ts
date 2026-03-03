import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@consentkit/db";
import { domains, workspaces } from "@consentkit/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";

const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  starter: 5,
  pro: Infinity,
};

const createDomainSchema = z.object({
  domain: z.string().min(1).regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain name"),
  bannerTitle: z.string().max(100).optional(),
  bannerDescription: z.string().max(500).optional(),
  theme: z.enum(["light", "dark"]).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.userId, session.user.id),
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const userDomains = await db.query.domains.findMany({
    where: eq(domains.workspaceId, workspace.id),
  });

  return NextResponse.json({ domains: userDomains });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.userId, session.user.id),
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  // Check domain limit
  const existingDomains = await db.query.domains.findMany({
    where: eq(domains.workspaceId, workspace.id),
  });

  const limit = PLAN_LIMITS[workspace.plan] ?? 1;
  if (existingDomains.length >= limit) {
    return NextResponse.json(
      {
        error: `Domain limit reached. Your ${workspace.plan} plan allows ${limit === Infinity ? "unlimited" : limit} domain(s). Upgrade to add more.`,
      },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createDomainSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { domain, bannerTitle, bannerDescription, theme } = parsed.data;

  // Check duplicate within workspace
  const duplicate = await db.query.domains.findFirst({
    where: and(
      eq(domains.workspaceId, workspace.id),
      eq(domains.domain, domain),
    ),
  });

  if (duplicate) {
    return NextResponse.json(
      { error: "Domain already registered in this workspace" },
      { status: 409 },
    );
  }

  const domainId = randomBytes(16).toString("hex");
  const apiKey = "ck_live_" + randomBytes(32).toString("hex");

  await db.insert(domains).values({
    id: domainId,
    workspaceId: workspace.id,
    domain,
    apiKey,
    bannerTitle: bannerTitle ?? "We value your privacy",
    bannerDescription:
      bannerDescription ??
      "We use cookies to enhance your browsing experience and analyze site traffic.",
    theme: theme ?? "light",
  });

  const created = await db.query.domains.findFirst({
    where: eq(domains.id, domainId),
  });

  return NextResponse.json({ domain: created }, { status: 201 });
}
