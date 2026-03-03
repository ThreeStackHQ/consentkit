import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { db } from "@consentkit/db";
import { workspaces } from "@consentkit/db";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.userId, session.user.id),
  });

  if (!workspace?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account found" },
      { status: 404 },
    );
  }

  const stripe = getStripe();
  const baseUrl =
    process.env.NEXTAUTH_URL ?? "https://consentkit.threestack.io";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: workspace.stripeCustomerId,
    return_url: `${baseUrl}/dashboard/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
