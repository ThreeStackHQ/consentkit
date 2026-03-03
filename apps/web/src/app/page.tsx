import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Globe, BarChart3, CheckCircle2, Zap, MapPin, Sliders, Check, X, Minus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ConsentKit — Cookie Consent That Just Works',
  description: 'GDPR-compliant cookie consent banner in 30 seconds. One script tag. Geo-based display for EU/UK/CA. No lawyers needed. Free plan available.',
  keywords: ['GDPR', 'cookie consent', 'CCPA', 'ePrivacy', 'CookieYes alternative', 'Cookiebot alternative', 'cookie banner', 'privacy compliance'],
  metadataBase: new URL('https://consentkit.threestack.io'),
  openGraph: {
    type: 'website',
    url: 'https://consentkit.threestack.io',
    title: 'ConsentKit — Cookie Consent That Just Works',
    description: 'GDPR/CCPA/ePrivacy compliant cookie consent in 30 seconds. 1 script tag, geo-based display, consent analytics.',
    siteName: 'ConsentKit',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ConsentKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ConsentKit — Cookie Consent That Just Works',
    description: 'GDPR-compliant banner in 30 seconds. One script tag. No lawyers needed.',
    images: ['/og-image.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ConsentKit',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  url: 'https://consentkit.threestack.io',
  description: 'GDPR, CCPA, and ePrivacy cookie consent management for indie SaaS. 1 script tag setup.',
  offers: [
    { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Starter', price: '9', priceCurrency: 'USD', billingIncrement: 'P1M' },
    { '@type': 'Offer', name: 'Pro', price: '29', priceCurrency: 'USD', billingIncrement: 'P1M' },
  ],
};

const features = [
  {
    icon: Zap,
    title: '1-Script Install',
    description: 'Paste one script tag before </head> and you\'re live. No npm packages, no configuration files.',
  },
  {
    icon: MapPin,
    title: 'Geo-Based Display',
    description: 'Automatically shows the consent banner only to visitors from EU, UK, and California. Invisible to everyone else.',
  },
  {
    icon: Sliders,
    title: 'Category Controls',
    description: 'Granular consent per category: Necessary, Analytics, Marketing, and Preferences. GDPR-spec compliant.',
  },
  {
    icon: BarChart3,
    title: 'Consent Analytics',
    description: 'Real-time opt-in rates, country breakdown, and consent history. Know exactly who consented to what.',
  },
];

const comparisonRows = [
  { label: 'Price/mo', consentkit: '$0–$29', cookieyes: '$0–$99+', cookiebot: '$0–$83+' },
  { label: 'Domains (free)', consentkit: '1', cookieyes: '1', cookiebot: '1' },
  { label: 'Visitors/mo (free)', consentkit: '10k', cookieyes: '5k', cookiebot: '10k' },
  { label: 'GDPR Compliant', consentkit: true, cookieyes: true, cookiebot: true },
  { label: 'Auto Geo Display', consentkit: true, cookieyes: false, cookiebot: false },
  { label: 'Built-in Analytics', consentkit: true, cookieyes: true, cookiebot: false },
  { label: 'Setup time', consentkit: '30 sec', cookieyes: '5 min', cookiebot: '10 min' },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for personal projects and side hustles.',
    features: ['1 domain', '10k visitors/mo', 'GDPR/CCPA/ePrivacy', 'Geo-based display', 'Basic analytics', 'ConsentKit branding'],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Starter',
    price: '$9',
    period: '/month',
    description: 'For indie hackers with multiple projects.',
    features: ['5 domains', '100k visitors/mo', 'Everything in Free', 'Remove branding', 'Full analytics', 'Email support'],
    cta: 'Start Starter',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For agencies and growing SaaS products.',
    features: ['Unlimited domains', '1M visitors/mo', 'Everything in Starter', 'Priority support', 'API access', 'Custom styling'],
    cta: 'Go Pro',
    highlighted: false,
  },
];

function ComparisonCell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-5 h-5 text-green-400 mx-auto" />;
  if (value === false) return <X className="w-5 h-5 text-slate-600 mx-auto" />;
  return <span className="text-slate-300 text-sm">{value}</span>;
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#0f0f1a]/90 backdrop-blur-md border-b border-indigo-500/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-indigo-400" />
            <span className="text-white font-semibold text-lg tracking-tight">ConsentKit</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</a>
            <a href="#compare" className="text-sm text-slate-400 hover:text-white transition-colors">Compare</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
          {/* Compliance badges */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
            {['GDPR ✓', 'CCPA ✓', 'ePrivacy ✓'].map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                {badge}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Cookie Consent That<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Just Works
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            GDPR-compliant banner in 30 seconds. One script tag. No lawyers needed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3.5 rounded-xl text-base transition-colors"
            >
              Start for Free →
            </Link>
            <a
              href="#features"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-3.5 rounded-xl text-base transition-colors"
            >
              See how it works
            </a>
          </div>

          {/* Code preview */}
          <div className="mt-14 bg-[#1a1a2e] border border-indigo-500/20 rounded-xl p-4 text-left max-w-xl mx-auto">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 text-xs text-slate-600">index.html</span>
            </div>
            <pre className="text-xs sm:text-sm font-mono text-slate-300 overflow-x-auto">
              <span className="text-slate-500">{`<!-- Paste before </head> —— that's it! -->`}</span>{'\n'}
              <span className="text-indigo-400">&lt;script</span>{' '}
              <span className="text-green-400">src</span>
              <span className="text-slate-300">=</span>
              <span className="text-yellow-300">&quot;https://cdn.consentkit.io/v1/banner.js&quot;</span>{'\n'}
              {'       '}
              <span className="text-green-400">data-key</span>
              <span className="text-slate-300">=</span>
              <span className="text-yellow-300">&quot;ck_live_your_key_here&quot;</span>
              <span className="text-indigo-400">&gt;&lt;/script&gt;</span>
            </pre>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 border-t border-indigo-500/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything you need for compliance</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Built for indie SaaS founders who want compliance without the complexity.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-[#1a1a2e] border border-indigo-500/20 rounded-xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-indigo-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-14">Up in 3 steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Add Your Domain', desc: 'Enter your domain name in the ConsentKit dashboard.' },
              { step: '02', title: 'Copy Snippet', desc: 'Get your unique script tag with your API key pre-filled.' },
              { step: '03', title: 'Paste & Go', desc: 'Paste before </head>. Your visitors are now GDPR-compliant.' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg mb-4">
                  {s.step}
                </div>
                <h3 className="text-white font-semibold mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section id="compare" className="py-20 border-t border-indigo-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How we stack up</h2>
            <p className="text-slate-400">ConsentKit vs the expensive alternatives</p>
          </div>
          <div className="bg-[#1a1a2e] border border-indigo-500/20 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-indigo-500/20">
                  <th className="text-left text-xs text-slate-500 uppercase tracking-wider py-4 px-6">Feature</th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-indigo-400 font-bold text-sm">ConsentKit</span>
                      <span className="text-xs text-indigo-400/60">$0–$29</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-slate-400 font-semibold text-sm">CookieYes</span>
                      <span className="text-xs text-slate-600">$0–$99+</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-slate-400 font-semibold text-sm">Cookiebot</span>
                      <span className="text-xs text-slate-600">$0–$83+</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-500/10">
                {comparisonRows.map((row) => (
                  <tr key={row.label} className="hover:bg-white/2 transition-colors">
                    <td className="py-3.5 px-6 text-sm text-slate-400">{row.label}</td>
                    <td className="py-3.5 px-4 text-center bg-indigo-600/5">
                      <ComparisonCell value={row.consentkit} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <ComparisonCell value={row.cookieyes} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <ComparisonCell value={row.cookiebot} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 border-t border-indigo-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Simple, honest pricing</h2>
            <p className="text-slate-400">No hidden fees. No visitor-based overage surprises.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-[#1a1a2e] rounded-2xl p-7 flex flex-col ${
                  plan.highlighted
                    ? 'border-2 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'border border-indigo-500/20'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400 text-sm mb-0.5">{plan.period}</span>
                </div>
                <p className="text-slate-400 text-sm mb-6">{plan.description}</p>
                <ul className="space-y-2.5 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`text-center font-medium py-2.5 rounded-xl text-sm transition-colors ${
                    plan.highlighted
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-[#0f0f1a] border border-indigo-500/20 hover:border-indigo-500/50 text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 border-t border-indigo-500/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-10">
            <Globe className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Become compliant in 30 seconds
            </h2>
            <p className="text-slate-400 mb-8 text-lg">
              Join thousands of indie founders who use ConsentKit to handle privacy compliance without the headache.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3.5 rounded-xl text-base transition-colors"
            >
              Get Started Free →
            </Link>
            <p className="text-slate-600 text-sm mt-4">No credit card required · Free plan forever</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-indigo-500/10 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span className="text-white font-semibold">ConsentKit</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#features" className="hover:text-slate-300 transition-colors">Features</a>
              <a href="#pricing" className="hover:text-slate-300 transition-colors">Pricing</a>
              <Link href="/login" className="hover:text-slate-300 transition-colors">Log in</Link>
              <Link href="/signup" className="hover:text-slate-300 transition-colors">Sign up</Link>
            </div>
            <p className="text-slate-600 text-sm">© 2026 ConsentKit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
