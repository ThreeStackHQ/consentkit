import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@consentkit/db";
import { workspaces } from "@consentkit/db";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

const PRICE_TO_TIER: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER ?? ""]: "starter",
  [process.env.STRIPE_PRICE_PRO ?? ""]: "pro",
};

function getTierFromSubscription(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0]?.price.id ?? "";
  return PRICE_TO_TIER[priceId] ?? "free";
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const subscription = event.data.object as Stripe.Subscription;
  const workspaceId = subscription.metadata?.workspaceId;

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      if (!workspaceId) break;
      const tier = getTierFromSubscription(subscription);
      const periodEnd = new Date((subscription.current_period_end ?? 0) * 1000);

      await db
        .update(workspaces)
        .set({
          plan: tier,
          stripeSubscriptionId: subscription.id,
          currentPeriodEnd: periodEnd,
        })
        .where(eq(workspaces.id, workspaceId));
      break;
    }

    case "customer.subscription.deleted": {
      if (!workspaceId) break;
      await db
        .update(workspaces)
        .set({
          plan: "free",
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
        })
        .where(eq(workspaces.id, workspaceId));
      break;
    }

    default:
      // Unhandled event type — ignore
      break;
  }

  return NextResponse.json({ received: true });
}
