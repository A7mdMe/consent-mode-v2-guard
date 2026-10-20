# ConsentModePro — Google Consent Mode v2 Synchronous Guard & Diagnostic Engine

[![License: Commercial / MIT Core](https://img.shields.io/badge/License-Dual--License-blue.svg)](LICENSE.md)
[![Google Consent Mode](https://img.shields.io/badge/Google%20Consent%20Mode-v2%20Compliant-success)](https://support.google.com/google-ads/answer/10000067)
[![Bundle Size](https://img.shields.io/badge/Bundle%20Size-%3C%204%20KB-brightgreen)](https://github.com/A7mdMe/consent-mode-v2-guard)
[![Live Web Auditor](https://img.shields.io/badge/Live%20Web%20Auditor-Test%20Your%20Site-orange)](https://a7mdme.github.io/consent-mode-v2-guard/)

**A zero-bloat, ultra-lightweight (&lt;4KB) synchronous guard and diagnostic engine that eliminates Google Ads conversion drops, missing audience modeling, and "Consent signal not detected" warnings across your web properties.**

---

## ⚡ The Problem: Why Sites Fail Google Consent Mode v2

Google strictly enforces **Consent Mode v2** across all properties collecting EEA/UK traffic. If your website has:
1. **Missing parameters:** Omitted `ad_user_data` or `ad_personalization` (v2 requirements).
2. **Race condition:** Google Tag Manager or `gtag.js` loaded *before* your CMP default consent command fired.
3. **No state persistence:** Returning visitors receive duplicate prompts or uninitialized signals.

**Result:** Google Ads disables conversion modeling and remarketing audiences, reporting:  
`"Consent signal not detected"` and sending invalid encrypted `gcd` parameters in tracking pings.

Traditional Consent Management Platforms (Cookiebot, OneTrust, Termly) charge **$15–$50 per month** ($180–$600/year per site) and inject 400KB+ of bloated JavaScript that damages your Google PageSpeed Insights and Core Web Vitals (INP / LCP).

---

## 🛠️ The Solution: ConsentModePro

- **Zero Monthly Subscriptions:** One-time purchase, perpetual commercial license.
- **Synchronous Head-Guard:** Guarantees `gtag('consent', 'default')` executes before any other tag or GTM container can load.
- **Under 4KB footprint:** Zero external CSS, zero npm dependencies, zero tracking servers.
- **Full v2 Compliance:** Strictly initializes all 4 mandatory parameters: `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`.
- **Pre-Built Adapters:** Ready-to-deploy code snippets for Shopify (`theme.liquid`), WordPress/WooCommerce (`functions.php`), Next.js 14/15 App Router, and static HTML/Webflow.

👉 **[Try the Free Online Web Auditor](https://a7mdme.github.io/consent-mode-v2-guard/)**  
👉 **[Purchase Pro Bundle with Adapters ($19 One-Time) on Whop](https://whop.com/checkout/plan_bCPln1DjqcSxp)**

---

## 🔍 Instant Diagnostic CLI

Run the diagnostic validator directly against your live website:

```bash
git clone https://github.com/A7mdMe/consent-mode-v2-guard.git
cd consent-mode-v2-guard
node consent-validator.mjs https://your-website.com
```

### Sample Output:
```text
============================================================
      ConsentModePro — Diagnostic Audit Report              
============================================================

Audited Target: https://your-website.com
Status: ✅ COMPLIANT

--- VERIFIED PASSES ---
  [PASS] Consent default call detected: gtag("consent", "default", {...})
  [PASS] All 4 mandatory Consent Mode v2 parameters are present
  [PASS] Order verification passed: Consent default executes before GTM
============================================================
```

---

## 🚀 3-Minute Quickstart

### 1. HTML / Webflow / Framer
Place this snippet at the very top of your `<head>` before any GTM or gtag script:

```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'analytics_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'wait_for_update': 500
  });
</script>
<!-- Load GTM strictly AFTER the default state is initialized -->
<script src="https://www.googletagmanager.com/gtm.js?id=GTM-XXXXX"></script>
```

### 2. Shopify Stores
Download the `shopify-theme.liquid` adapter from the Pro Pack and add:
```liquid
{% render 'consent-mode-guard' %}
```
immediately below the opening `<head>` tag in `layout/theme.liquid`.

### 3. Next.js 14 & 15 (App Router)
Include the `<NextJsConsentGuard />` component with `strategy="beforeInteractive"` in `app/layout.tsx`.

---

## 💎 Pro Package Contents ($19 One-Time)

Available via instant digital delivery on [Whop](https://whop.com/checkout/plan_bCPln1DjqcSxp):
- `consent-mode-guard.js`: Complete accessible modal UI with granular preference toggles and `localStorage` state management.
- `adapters/shopify-theme.liquid`: 1-click Shopify snippet.
- `adapters/wordpress-plugin.php`: WordPress priority 1 hook plugin.
- `adapters/NextJsConsentGuard.tsx`: Next.js 14/15 App Router component.
- `adapters/vanilla-html.html`: Static web drop-in.
- `GTM_TRIGGER_GUIDE.md`: Full GTM trigger gating walkthrough for Meta Pixel, TikTok, and Google Ads.
- Perpetual single & multi-store commercial license.

---

## 📄 License
The diagnostic validator CLI and core architecture specifications are open-source under the MIT License. The comprehensive pre-packaged platform adapters and production UI suite are licensed under the ConsentModePro Commercial License.
