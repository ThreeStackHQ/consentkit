import { NextRequest, NextResponse } from "next/server";
import { db } from "@consentkit/db";
import { domains, workspaces } from "@consentkit/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";

async function getOwnedDomain(userId: string, domainId: string) {
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.userId, userId),
  });
  if (!workspace) return null;

  const domain = await db.query.domains.findFirst({
    where: and(
      eq(domains.id, domainId),
      eq(domains.workspaceId, workspace.id),
    ),
  });
  return domain ?? null;
}

const updateDomainSchema = z.object({
  bannerTitle: z.string().max(100).optional(),
  bannerDescription: z.string().max(500).optional(),
  theme: z.enum(["light", "dark"]).optional(),
  position: z.enum(["bottom", "top", "modal"]).optional(),
  analyticsEnabled: z.boolean().optional(),
  marketingEnabled: z.boolean().optional(),
  preferencesEnabled: z.boolean().optional(),
  showForEU: z.boolean().optional(),
  showForUK: z.boolean().optional(),
  showForCA: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const domain = await getOwnedDomain(session.user.id, id);

  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  return NextResponse.json({ domain });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const domain = await getOwnedDomain(session.user.id, id);

  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateDomainSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await db
    .update(domains)
    .set({ ...parsed.data })
    .where(eq(domains.id, id));

  const updated = await db.query.domains.findFirst({
    where: eq(domains.id, id),
  });

  return NextResponse.json({ domain: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const domain = await getOwnedDomain(session.user.id, id);

  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  await db.delete(domains).where(eq(domains.id, id));

  return NextResponse.json({ success: true });
}
