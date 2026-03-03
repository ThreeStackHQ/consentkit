import {
  pgTable, text, timestamp, boolean, jsonb, integer, index
} from "drizzle-orm/pg-core";

// NextAuth tables
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  sessionToken: text("session_token").unique().notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
});

// Business tables
export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  plan: text("plan").notNull().default("free"), // free | starter | pro
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodEnd: timestamp("current_period_end"),
  digestUnsubscribeToken: text("digest_unsubscribe_token"),
  digestEnabled: boolean("digest_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const domains = pgTable("domains", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  domain: text("domain").notNull(), // e.g. myapp.com
  apiKey: text("api_key").notNull().unique(), // ck_live_xxx
  // Banner config
  bannerTitle: text("banner_title").default("We value your privacy"),
  bannerDescription: text("banner_description").default("We use cookies to enhance your browsing experience and analyze site traffic."),
  theme: text("theme").default("light"), // light | dark
  position: text("position").default("bottom"), // bottom | top | modal
  // Categories enabled
  analyticsEnabled: boolean("analytics_enabled").default(true),
  marketingEnabled: boolean("marketing_enabled").default(true),
  preferencesEnabled: boolean("preferences_enabled").default(true),
  // Geo rules
  showForEU: boolean("show_for_eu").default(true),
  showForUK: boolean("show_for_uk").default(true),
  showForCA: boolean("show_for_ca").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  workspaceIdx: index("domains_workspace_idx").on(t.workspaceId),
}));

export const consentLogs = pgTable("consent_logs", {
  id: text("id").primaryKey(),
  domainId: text("domain_id").notNull().references(() => domains.id, { onDelete: "cascade" }),
  visitorId: text("visitor_id").notNull(), // UUID from localStorage
  action: text("action").notNull(), // accept_all | reject_all | custom
  categories: jsonb("categories").notNull(), // { necessary: true, analytics: true, marketing: false, preferences: false }
  countryCode: text("country_code"), // 2-letter ISO
  ipHash: text("ip_hash"), // SHA-256 of IP (no PII)
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  domainIdx: index("consent_logs_domain_idx").on(t.domainId),
  createdAtIdx: index("consent_logs_created_at_idx").on(t.createdAt),
}));
