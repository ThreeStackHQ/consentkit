import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ConsentKit — GDPR Cookie Consent at $9/mo",
    template: "%s | ConsentKit",
  },
  description:
    "GDPR, CCPA, and ePrivacy cookie consent management for indie SaaS. 1 script tag, geo-based display, consent analytics. CookieYes alternative at $9/mo.",
  keywords: ["GDPR", "cookie consent", "CCPA", "privacy", "compliance", "CookieYes alternative"],
  metadataBase: new URL("https://consentkit.threestack.io"),
  openGraph: {
    type: "website",
    url: "https://consentkit.threestack.io",
    title: "ConsentKit — GDPR Cookie Consent at $9/mo",
    description: "Privacy compliance for indie SaaS. 1 script tag setup. GDPR/CCPA/ePrivacy compliant.",
    siteName: "ConsentKit",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConsentKit",
    description: "Cookie consent management for indie SaaS at $9/mo",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
