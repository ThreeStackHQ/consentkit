import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
  STRIPE_PRICE_STARTER: z.string().startsWith("price_").optional(),
  STRIPE_PRICE_PRO: z.string().startsWith("price_").optional(),
  RESEND_API_KEY: z.string().startsWith("re_").optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  CRON_SECRET: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Only warn in development/build; production startup will catch real issues
  if (process.env.NODE_ENV !== "production" || process.env.VERCEL) {
    console.warn("⚠️  Missing environment variables:", parsed.error.flatten().fieldErrors);
  }
}

export const env = (parsed.success ? parsed.data : process.env) as z.infer<typeof envSchema>;
