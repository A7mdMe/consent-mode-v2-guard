# Google Consent Mode v2 — Static Syntax Scanner & Reference Implementation

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Google Tag Platform Documentation](https://img.shields.io/badge/Docs-Google%20Consent%20Mode-success)](https://developers.google.com/tag-platform/security/guides/consent)
[![Live Web Scanner](https://img.shields.io/badge/Web%20Scanner-GitHub%20Pages-orange)](https://a7mdme.github.io/consent-mode-v2-guard/)

A lightweight open-source static code scanner and minimal developer reference implementation for Google Consent Mode v2 parameters (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`).

---

## 📌 Context & Official Requirements

Google requires **Consent Mode v2** signals for traffic originating from the European Economic Area (EEA) and the UK when using Google Ads or Google Analytics 4 features (such as audience remarketing and conversion modeling).

- **Official Google Documentation:** [Set up consent mode on websites (Google Developers)](https://developers.google.com/tag-platform/security/guides/consent)
- **Primary Google Help Center:** [About consent mode (Google Ads Help)](https://support.google.com/google-ads/answer/10000067)

---

## 💡 Free & Native Alternatives for Website Owners

Before writing custom code or installing third-party scripts, note that standard platforms have native or free solutions:

1. **Shopify:** Native Google Consent Mode v2 is built directly into Shopify Admin. Under **Settings -> Customer Privacy**, merchants can activate native Google Consent Mode integration for free with zero custom code.
2. **WordPress:** Popular CMP plugins such as *CookieYes* and *Complianz* offer free tiers with automated cookie scanning and 1-click GTM integrations.
3. **Google Tag Manager:** Official Community Templates exist inside GTM (e.g., templates from certified CMP partners) which can be added directly to containers.

---

## 🔍 Static Syntax Scanner CLI

This tool performs static pattern matching to inspect whether a snippet contains the core v2 keys and whether `gtag('consent', 'default')` precedes the GTM container script tag in the HTML source text.

> **Important Limitation:** Static text analysis checks string patterns only. It does **not** verify runtime browser execution, dynamic tag gating, server-side payload delivery (e.g. Google's encrypted `gcd` query parameter), or legal regulatory compliance (GDPR/ePrivacy). For end-to-end runtime verification, use [Google Tag Assistant](https://tagassistant.google.com/).

### Usage:

```bash
git clone https://github.com/A7mdMe/consent-mode-v2-guard.git
cd consent-mode-v2-guard
node consent-validator.mjs https://example.com
```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
