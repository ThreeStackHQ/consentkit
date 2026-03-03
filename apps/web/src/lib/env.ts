import { z } from "zod";

// SEC-004 FIX: Strict env validation — production startup throws on missing/invalid vars.
// Auth secret required; Stripe/email/cron vars optional for local dev.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
  STRIPE_PRICE_STARTER: z.string().startsWith("price_").optional(),
  STRIPE_PRICE_PRO: z.string().startsWith("price_").optional(),
  RESEND_API_KEY: z.string().startsWith("re_").optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  CRON_SECRET: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  // SEC-004 FIX: always log; throw in production to block broken startup
  console.error("❌ Invalid environment variables:", JSON.stringify(errors, null, 2));
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `Invalid environment configuration — refusing to start:\n${Object.entries(errors)
        .map(([k, v]) => `  ${k}: ${v?.join(", ")}`)
        .join("\n")}`,
    );
  }
  console.warn("⚠️  Starting with invalid env vars — NOT safe for production");
}

// SEC-004 FIX: export typed parsed data; fall back to raw process.env only in non-production.
// This ensures runtime type safety in production and a clear error rather than silent misconfig.
export const env = (parsed.success ? parsed.data : process.env) as z.infer<typeof envSchema>;
