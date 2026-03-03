import { NextRequest, NextResponse } from "next/server";
import { db } from "@consentkit/db";
import { consentLogs, domains, workspaces } from "@consentkit/db";
import { eq, and, gte } from "drizzle-orm";
import { auth } from "@/auth";

interface CategoryCounts {
  accept: number;
  reject: number;
  partial: number;
  total: number;
}

type CountryCounts = Record<string, CategoryCounts>;
type DayCounts = Record<string, CategoryCounts>;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ domainId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { domainId } = await params;
  const range = req.nextUrl.searchParams.get("range") ?? "7d";
  const days = range === "30d" ? 30 : 7;

  // IDOR check — verify domain belongs to user's workspace
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.userId, session.user.id),
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const domain = await db.query.domains.findFirst({
    where: and(
      eq(domains.id, domainId),
      eq(domains.workspaceId, workspace.id),
    ),
  });

  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await db.query.consentLogs.findMany({
    where: and(
      eq(consentLogs.domainId, domainId),
      gte(consentLogs.createdAt, since),
    ),
    columns: {
      visitorId: true,
      action: true,
      countryCode: true,
      createdAt: true,
    },
  });

  const total = logs.length;
  const acceptCount = logs.filter((l) => l.action === "accept").length;
  const rejectCount = logs.filter((l) => l.action === "reject").length;
  const partialCount = logs.filter((l) => l.action === "partial").length;

  const uniqueVisitors = new Set(logs.map((l) => l.visitorId)).size;

  // By country
  const byCntry: CountryCounts = {};
  for (const log of logs) {
    const cc = log.countryCode ?? "XX";
    if (!byCntry[cc]) byCntry[cc] = { accept: 0, reject: 0, partial: 0, total: 0 };
    byCntry[cc][log.action as keyof CategoryCounts]++;
    byCntry[cc].total++;
  }

  const byCountry = Object.entries(byCntry)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([country_code, counts]) => ({
      country_code,
      total: counts.total,
      optInRate:
        counts.total > 0
          ? Math.round((counts.accept / counts.total) * 100)
          : 0,
    }));

  // By day
  const byDayMap: DayCounts = {};
  for (const log of logs) {
    const date = log.createdAt
      ? log.createdAt.toISOString().slice(0, 10)
      : "unknown";
    if (!byDayMap[date]) byDayMap[date] = { accept: 0, reject: 0, partial: 0, total: 0 };
    byDayMap[date][log.action as keyof CategoryCounts]++;
    byDayMap[date].total++;
  }

  const byDay = Object.entries(byDayMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, counts]) => ({
      date,
      total: counts.total,
      accepted: counts.accept,
      rejected: counts.reject,
      partial: counts.partial,
    }));

  // Recent logs (anonymized)
  const recentLogs = await db.query.consentLogs.findMany({
    where: eq(consentLogs.domainId, domainId),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit: 20,
    columns: {
      id: true,
      visitorId: true,
      action: true,
      countryCode: true,
      createdAt: true,
    },
  });

  const anonymizedLogs = recentLogs.map((l) => ({
    id: l.id,
    visitorId: l.visitorId.slice(0, 8) + "...",
    action: l.action,
    countryCode: l.countryCode ?? "XX",
    ts: l.createdAt,
  }));

  return NextResponse.json({
    domain: domain.domain,
    range,
    totalVisitors: uniqueVisitors,
    totalConsents: total,
    optInRate: total > 0 ? Math.round((acceptCount / total) * 100) : 0,
    optOutRate: total > 0 ? Math.round((rejectCount / total) * 100) : 0,
    partialRate: total > 0 ? Math.round((partialCount / total) * 100) : 0,
    byCountry,
    byDay,
    recentLogs: anonymizedLogs,
  });
}
