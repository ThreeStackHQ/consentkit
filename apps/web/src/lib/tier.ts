import { db } from "@consentkit/db";
import { workspaces, domains } from "@consentkit/db";
import { eq, count } from "drizzle-orm";

export type Tier = "free" | "starter" | "pro";

export interface TierLimits {
  maxDomains: number;
  maxVisitors: number;
  analyticsAccess: boolean;
  weeklyDigest: boolean;
  auditLogExport: boolean;
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    maxDomains: 1,
    maxVisitors: 10_000,
    analyticsAccess: false,
    weeklyDigest: false,
    auditLogExport: false,
  },
  starter: {
    maxDomains: 5,
    maxVisitors: 100_000,
    analyticsAccess: true,
    weeklyDigest: true,
    auditLogExport: false,
  },
  pro: {
    maxDomains: Infinity,
    maxVisitors: Infinity,
    analyticsAccess: true,
    weeklyDigest: true,
    auditLogExport: true,
  },
};

export function getTierLimits(tier: string): TierLimits {
  return TIER_LIMITS[tier as Tier] ?? TIER_LIMITS.free;
}

export async function getWorkspaceTier(workspaceId: string): Promise<Tier> {
  const ws = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
    columns: { plan: true },
  });
  return (ws?.plan as Tier) ?? "free";
}

export async function canAddDomain(workspaceId: string): Promise<boolean> {
  const ws = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
  });
  if (!ws) return false;

  const limits = getTierLimits(ws.plan);
  if (limits.maxDomains === Infinity) return true;

  const result = await db
    .select({ total: count() })
    .from(domains)
    .where(eq(domains.workspaceId, workspaceId));

  const currentCount = result[0]?.total ?? 0;
  return currentCount < limits.maxDomains;
}
