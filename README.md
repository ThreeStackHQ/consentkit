# ConsentKit

> GDPR/CCPA/ePrivacy cookie consent management for indie SaaS — CookieYes but $9/mo

## The Problem

CookieYes starts at $29/mo. Cookiebot is $13/mo. Most indie hackers need GDPR compliance but can't justify the cost.

## The Solution

ConsentKit: 1 script tag, geo-based display, consent analytics, $9/mo.

```html
<script src="https://cdn.consentkit.threestack.io/v1/consent.iife.js" 
        data-key="ck_live_your_key"></script>
```

## Features

- 🍪 **Auto geo-detection** — shows banner only to EU/UK/CA visitors
- 📊 **Consent analytics** — opt-in rates, country breakdown, trend charts
- 🎨 **Customizable** — light/dark theme, top/bottom/modal position
- 🔒 **Privacy-first** — visitor IDs (no PII), IP hashed with SHA-256
- 📧 **Weekly digest** — consent stats delivered to your inbox
- ⚡ **< 3KB** — vanilla JS, no dependencies

## Pricing

| Plan | Price | Domains | Visitors/mo |
|------|-------|---------|-------------|
| Free | $0 | 1 | 10K |
| Starter | $9/mo | 5 | 100K |
| Pro | $29/mo | Unlimited | Unlimited |

## Tech Stack

- Next.js 14 + TypeScript
- Drizzle ORM + PostgreSQL (Neon)
- Vanilla JS widget (< 3KB)
- Resend (email)
- Stripe (billing)

## Development

```bash
pnpm install
pnpm dev
```

Live at: https://consentkit.threestack.io
