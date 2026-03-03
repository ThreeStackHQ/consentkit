import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { db } from "@consentkit/db";
import { workspaces } from "@consentkit/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const checkoutSchema = z.object({
  tier: z.enum(["starter", "pro"]),
});

const PRICE_MAP: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const { tier } = parsed.data;

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.userId, session.user.id),
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const stripe = getStripe();

  // Get or create Stripe customer
  let customerId = workspace.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email ?? undefined,
      name: session.user.name ?? undefined,
      metadata: { workspaceId: workspace.id, userId: session.user.id },
    });
    customerId = customer.id;
    await db
      .update(workspaces)
      .set({ stripeCustomerId: customerId })
      .where(eq(workspaces.id, workspace.id));
  }

  const priceId = PRICE_MAP[tier];
  if (!priceId) {
    return NextResponse.json({ error: "Price not configured" }, { status: 500 });
  }

  const baseUrl =
    process.env.NEXTAUTH_URL ?? "https://consentkit.threestack.io";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard/billing?success=true`,
    cancel_url: `${baseUrl}/dashboard/billing`,
    metadata: { workspaceId: workspace.id, tier },
    subscription_data: {
      metadata: { workspaceId: workspace.id, tier },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
