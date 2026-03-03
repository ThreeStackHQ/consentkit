import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@consentkit/db";
import { workspaces } from "@consentkit/db";
import { eq } from "drizzle-orm";

function verifyUnsubscribeToken(token: string): string | null {
  try {
    const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";
    const decoded = JSON.parse(Buffer.from(token, "base64url").toString("utf-8")) as {
      workspaceId: string;
      sig: string;
    };

    const payload = `${decoded.workspaceId}:unsubscribe`;
    const expectedSig = createHmac("sha256", secret).update(payload).digest("hex");

    if (expectedSig !== decoded.sig) return null;
    return decoded.workspaceId;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const workspaceId = verifyUnsubscribeToken(token);
  if (!workspaceId) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const ws = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
  });

  if (!ws) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  await db
    .update(workspaces)
    .set({ digestEnabled: false })
    .where(eq(workspaces.id, workspaceId));

  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head><title>Unsubscribed — ConsentKit</title></head>
<body style="margin:0;background:#0f0e2b;font-family:-apple-system,sans-serif;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="text-align:center;padding:40px;">
    <div style="font-size:48px;margin-bottom:16px;">✅</div>
    <h1 style="color:#a5b4fc;margin:0 0 8px;">Unsubscribed</h1>
    <p style="color:#94a3b8;">You've been removed from ConsentKit weekly reports.</p>
    <a href="https://consentkit.threestack.io/dashboard" style="color:#6366f1;text-decoration:none;font-size:14px;">← Back to Dashboard</a>
  </div>
</body>
</html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html" },
    },
  );
}
