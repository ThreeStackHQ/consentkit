import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { Resend } from "resend";
import { db } from "@consentkit/db";
import { workspaces, domains, consentLogs, users } from "@consentkit/db";
import { eq, gte, lt, and } from "drizzle-orm";

// SEC-002 FIX: Escape user-supplied strings before embedding in HTML email
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function buildUnsubscribeToken(workspaceId: string): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";
  const payload = `${workspaceId}:unsubscribe`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  const raw = Buffer.from(JSON.stringify({ workspaceId, sig })).toString("base64url");
  return raw;
}

function buildDigestHtml(params: {
  userName: string;
  workspaceName: string;
  domainStats: Array<{
    domain: string;
    thisWeek: { total: number; accepted: number; optInRate: number };
    lastWeek: { total: number; accepted: number; optInRate: number };
    topCountries: Array<{ country: string; count: number }>;
  }>;
  unsubscribeUrl: string;
}): string {
  const { userName, workspaceName, domainStats, unsubscribeUrl } = params;

  const domainRows = domainStats
    .map(
      (ds) => `
    <div style="margin-bottom:24px;padding:20px;background:#1e1b4b;border-radius:8px;">
      <h3 style="color:#a5b4fc;margin:0 0 12px;font-size:16px;">${escapeHtml(ds.domain)}</h3>
      <table width="100%" cellpadding="8" cellspacing="0">
        <tr>
          <td style="color:#94a3b8;font-size:13px;">Visitors this week</td>
          <td style="color:#e2e8f0;font-size:14px;text-align:right;font-weight:600;">${ds.thisWeek.total.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="color:#94a3b8;font-size:13px;">Opt-in rate</td>
          <td style="color:${ds.thisWeek.optInRate >= 60 ? "#34d399" : "#f87171"};font-size:14px;text-align:right;font-weight:600;">${ds.thisWeek.optInRate}%</td>
        </tr>
        <tr>
          <td style="color:#94a3b8;font-size:13px;">vs last week</td>
          <td style="color:#94a3b8;font-size:13px;text-align:right;">${ds.lastWeek.total > 0 ? `${ds.lastWeek.optInRate}% opt-in` : "No data"}</td>
        </tr>
        ${
          ds.topCountries.length > 0
            ? `<tr><td style="color:#94a3b8;font-size:13px;">Top countries</td><td style="color:#e2e8f0;font-size:13px;text-align:right;">${ds.topCountries.map((c) => `${escapeHtml(c.country)} (${c.count})`).join(", ")}</td></tr>`
            : ""
        }
      </table>
    </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>ConsentKit Weekly Report</title></head>
<body style="margin:0;padding:0;background:#0f0e2b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0">
        <tr><td style="background:#1e1b4b;border-radius:12px;padding:40px;border:1px solid #312e81;">
          <p style="color:#818cf8;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">ConsentKit</p>
          <h1 style="color:#e2e8f0;font-size:22px;margin:0 0 8px;">Weekly Consent Report</h1>
          <p style="color:#94a3b8;font-size:14px;margin:0 0 32px;">Hey ${escapeHtml(userName)}, here&#x27;s how ${escapeHtml(workspaceName)} performed this week.</p>

          ${domainRows}

          <hr style="border:none;border-top:1px solid #312e81;margin:32px 0;">
          <p style="color:#475569;font-size:12px;text-align:center;margin:0;">
            <a href="${unsubscribeUrl}" style="color:#6366f1;text-decoration:underline;">Unsubscribe from weekly reports</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "ConsentKit <digest@consentkit.threestack.io>";
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://consentkit.threestack.io";

  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(lastWeekStart.getDate() - 14);

  // Find all opted-in workspaces
  const allWorkspaces = await db.query.workspaces.findMany({
    where: eq(workspaces.digestEnabled, true),
  });

  let sent = 0;
  let skipped = 0;

  for (const ws of allWorkspaces) {
    // Skip free tier (no digest)
    if (ws.plan === "free") {
      skipped++;
      continue;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, ws.userId),
    });
    if (!user?.email) {
      skipped++;
      continue;
    }

    const userDomains = await db.query.domains.findMany({
      where: eq(domains.workspaceId, ws.id),
    });

    if (userDomains.length === 0) {
      skipped++;
      continue;
    }

    const domainStats = await Promise.all(
      userDomains.map(async (d) => {
        const thisWeekLogs = await db.query.consentLogs.findMany({
          where: and(
            eq(consentLogs.domainId, d.id),
            gte(consentLogs.createdAt, thisWeekStart),
          ),
          columns: { action: true, countryCode: true },
        });

        // BUG-002 FIX: use proper date range (lastWeekStart..thisWeekStart) for last week
        const lastWeekLogs = await db.query.consentLogs.findMany({
          where: and(
            eq(consentLogs.domainId, d.id),
            gte(consentLogs.createdAt, lastWeekStart),
            lt(consentLogs.createdAt, thisWeekStart),
          ),
          columns: { action: true },
        });

        // This week stats
        const thisTotal = thisWeekLogs.length;
        const thisAccepted = thisWeekLogs.filter((l) => l.action === "accept").length;

        // Top countries
        const countryCounts: Record<string, number> = {};
        for (const log of thisWeekLogs) {
          const cc = log.countryCode ?? "XX";
          countryCounts[cc] = (countryCounts[cc] ?? 0) + 1;
        }
        const topCountries = Object.entries(countryCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([country, count]) => ({ country, count }));

        // Last week stats (BUG-002 FIX: now using correct date-bounded query)
        const lastTotal = lastWeekLogs.length;
        const lastAccepted = lastWeekLogs.filter((l) => l.action === "accept").length;

        return {
          domain: d.domain,
          thisWeek: {
            total: thisTotal,
            accepted: thisAccepted,
            optInRate: thisTotal > 0 ? Math.round((thisAccepted / thisTotal) * 100) : 0,
          },
          lastWeek: {
            total: lastTotal,
            accepted: lastAccepted,
            optInRate: lastTotal > 0 ? Math.round((lastAccepted / lastTotal) * 100) : 0,
          },
          topCountries,
        };
      }),
    );

    const token = buildUnsubscribeToken(ws.id);
    const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${token}`;

    const html = buildDigestHtml({
      userName: user.name ?? "there",
      workspaceName: ws.name,
      domainStats,
      unsubscribeUrl,
    });

    try {
      await resend.emails.send({
        from: fromEmail,
        to: user.email,
        subject: `Your ConsentKit Weekly Report — ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        html,
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send digest to ${user.email}:`, err);
      skipped++;
    }
  }

  return NextResponse.json({ sent, skipped, total: allWorkspaces.length });
}
