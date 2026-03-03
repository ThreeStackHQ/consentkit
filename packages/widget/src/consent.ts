/*!
 * ConsentKit Widget v1.0.0
 * GDPR/CCPA/ePrivacy cookie consent manager
 * https://consentkit.threestack.io
 */

interface ConsentKitConfig {
  key: string;
  apiBase?: string;
}

interface DomainConfig {
  bannerTitle: string;
  bannerDescription: string;
  theme: "light" | "dark";
  position: "bottom" | "top" | "modal";
  analyticsEnabled: boolean;
  marketingEnabled: boolean;
  preferencesEnabled: boolean;
  showForEU: boolean;
  showForUK: boolean;
  showForCA: boolean;
}

interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  action: "accept_all" | "reject_all" | "custom" | null;
  decidedAt: number | null;
}

const EU_COUNTRIES = new Set([
  "AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI","FR","GR","HR","HU",
  "IE","IT","LT","LU","LV","MT","NL","PL","PT","RO","SE","SI","SK","IS","LI","NO"
]);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function getVisitorId(): string {
  const key = "ck_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function getStoredConsent(apiKey: string): ConsentState | null {
  const key = `ck_consent_${apiKey}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw) as ConsentState;
    // Re-show banner after 13 months (GDPR recommendation)
    if (state.decidedAt && Date.now() - state.decidedAt > 13 * 30 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

function storeConsent(apiKey: string, state: ConsentState): void {
  const key = `ck_consent_${apiKey}`;
  localStorage.setItem(key, JSON.stringify({ ...state, decidedAt: Date.now() }));
}

function shouldShowBanner(config: DomainConfig, countryCode: string | null): boolean {
  if (!countryCode) return true; // Show by default if unknown
  const cc = countryCode.toUpperCase();
  if (config.showForEU && EU_COUNTRIES.has(cc)) return true;
  if (config.showForUK && cc === "UK") return true;
  if (config.showForCA && cc === "CA") return true;
  return false;
}

async function recordConsent(
  apiBase: string,
  apiKey: string,
  state: ConsentState,
  countryCode: string | null
): Promise<void> {
  const visitorId = getVisitorId();
  try {
    await fetch(`${apiBase}/api/widget/consent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: apiKey,
        visitorId,
        action: state.action,
        categories: {
          necessary: state.necessary,
          analytics: state.analytics,
          marketing: state.marketing,
          preferences: state.preferences,
        },
        countryCode,
      }),
    });
  } catch {
    // Silent fail — consent is stored locally regardless
  }
}

function renderBanner(config: DomainConfig, onAcceptAll: () => void, onRejectAll: () => void, onCustomize: () => void): HTMLElement {
  const isDark = config.theme === "dark";
  const bg = isDark ? "#1e1b4b" : "#ffffff";
  const text = isDark ? "#e2e8f0" : "#1e293b";
  const btnPrimary = "#6366f1";
  const btnSecondary = isDark ? "#374151" : "#f1f5f9";
  const btnSecText = isDark ? "#e2e8f0" : "#374151";
  const shadow = isDark ? "0 -4px 20px rgba(0,0,0,0.4)" : "0 -4px 20px rgba(0,0,0,0.1)";

  const isModal = config.position === "modal";
  const positionStyle = config.position === "top"
    ? "top: 0; left: 0; right: 0;"
    : isModal
      ? "top: 50%; left: 50%; transform: translate(-50%, -50%);"
      : "bottom: 0; left: 0; right: 0;";

  const banner = document.createElement("div");
  banner.id = "ck-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookie consent");
  banner.style.cssText = `
    position: fixed;
    ${positionStyle}
    background: ${bg};
    color: ${text};
    padding: 20px 24px;
    z-index: 2147483647;
    box-shadow: ${shadow};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    box-sizing: border-box;
    ${isModal ? "max-width: 480px; border-radius: 12px;" : ""}
  `;

  const title = document.createElement("h2");
  title.textContent = escapeHtml(config.bannerTitle);
  title.style.cssText = `margin: 0 0 8px; font-size: 16px; font-weight: 600; color: ${text};`;

  const desc = document.createElement("p");
  desc.textContent = escapeHtml(config.bannerDescription);
  desc.style.cssText = `margin: 0 0 16px; opacity: 0.8;`;

  const buttons = document.createElement("div");
  buttons.style.cssText = `display: flex; gap: 8px; flex-wrap: wrap;`;

  const makeBtn = (label: string, primary: boolean, onClick: () => void): HTMLButtonElement => {
    const btn = document.createElement("button");
    btn.textContent = escapeHtml(label);
    btn.type = "button";
    btn.style.cssText = `
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      background: ${primary ? btnPrimary : btnSecondary};
      color: ${primary ? "#ffffff" : btnSecText};
    `;
    btn.addEventListener("click", onClick);
    return btn;
  };

  buttons.appendChild(makeBtn("Accept All", true, onAcceptAll));
  buttons.appendChild(makeBtn("Reject All", false, onRejectAll));
  buttons.appendChild(makeBtn("Customize", false, onCustomize));

  banner.appendChild(title);
  banner.appendChild(desc);
  banner.appendChild(buttons);
  return banner;
}

async function init(config: ConsentKitConfig): Promise<void> {
  const apiBase = config.apiBase || "https://consentkit.threestack.io";

  // Fetch domain config
  let domainConfig: DomainConfig;
  try {
    const res = await fetch(`${apiBase}/api/widget/config?key=${encodeURIComponent(config.key)}`);
    if (!res.ok) return;
    domainConfig = await res.json();
  } catch {
    return;
  }

  // Check stored consent (re-show after 13 months)
  const stored = getStoredConsent(config.key);
  if (stored?.action) return; // Already decided

  // Detect country via Cloudflare header (or skip for non-EU)
  let countryCode: string | null = null;
  try {
    const geoRes = await fetch(`${apiBase}/api/widget/geo`);
    if (geoRes.ok) {
      const geo = await geoRes.json();
      countryCode = geo.country || null;
    }
  } catch {
    // If geo fails, show banner by default (conservative)
  }

  // Don't show if not required for this country
  if (!shouldShowBanner(domainConfig, countryCode)) return;

  // Wait for DOM
  if (document.readyState === "loading") {
    await new Promise<void>((r) => document.addEventListener("DOMContentLoaded", () => r()));
  }

  const acceptAll = async (): Promise<void> => {
    const state: ConsentState = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      action: "accept_all",
      decidedAt: Date.now(),
    };
    storeConsent(config.key, state);
    document.getElementById("ck-banner")?.remove();
    document.getElementById("ck-overlay")?.remove();
    await recordConsent(apiBase, config.key, state, countryCode);
    window.dispatchEvent(new CustomEvent("ck:consent", { detail: state }));
  };

  const rejectAll = async (): Promise<void> => {
    const state: ConsentState = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      action: "reject_all",
      decidedAt: Date.now(),
    };
    storeConsent(config.key, state);
    document.getElementById("ck-banner")?.remove();
    document.getElementById("ck-overlay")?.remove();
    await recordConsent(apiBase, config.key, state, countryCode);
    window.dispatchEvent(new CustomEvent("ck:consent", { detail: state }));
  };

  const customize = (): void => {
    // TODO: Show granular settings panel
    // For now, show simple modal with category checkboxes
    alert("Granular consent settings coming soon. For now, please Accept or Reject all.");
  };

  if (domainConfig.position === "modal") {
    const overlay = document.createElement("div");
    overlay.id = "ck-overlay";
    overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:2147483646;";
    document.body.appendChild(overlay);
  }

  const banner = renderBanner(domainConfig, acceptAll, rejectAll, customize);
  document.body.appendChild(banner);
}

// Auto-init from script tag attributes
const scripts = document.querySelectorAll<HTMLScriptElement>("script[data-key]");
scripts.forEach((script) => {
  const key = script.getAttribute("data-key");
  const apiBase = script.getAttribute("data-api-base") || undefined;
  if (key) init({ key, apiBase });
});

// Also expose manual init
(window as any).ConsentKit = { init };
