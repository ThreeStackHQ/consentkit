import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db } from "@consentkit/db";
import { users, workspaces, domains } from "@consentkit/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function generateId(): string {
  return randomBytes(16).toString("hex");
}

function generateApiKey(): string {
  return "ck_live_" + randomBytes(32).toString("hex");
}

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, string> = {};

    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const fd = await req.formData();
      fd.forEach((v, k) => {
        body[k] = v.toString();
      });
    }

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
      return NextResponse.redirect(
        new URL(`/signup?error=${encodeURIComponent(firstError)}`, req.url),
        { status: 302 },
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existing) {
      return NextResponse.redirect(
        new URL("/signup?error=Account+already+exists", req.url),
        { status: 302 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const userId = generateId();
    const workspaceId = generateId();
    const domainId = generateId();
    const apiKey = generateApiKey();

    // Derive initial domain from email
    const emailDomain = email.split("@")[1] ?? "my-website.com";

    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        name,
        email,
        passwordHash,
      });

      await tx.insert(workspaces).values({
        id: workspaceId,
        userId,
        name: `${name}'s Workspace`,
        plan: "free",
      });

      await tx.insert(domains).values({
        id: domainId,
        workspaceId,
        domain: emailDomain,
        apiKey,
      });
    });

    return NextResponse.redirect(new URL("/login?welcome=true", req.url), {
      status: 302,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.redirect(
      new URL("/signup?error=Server+error%2C+please+try+again", req.url),
      { status: 302 },
    );
  }
}
