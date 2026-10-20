#!/usr/bin/env node

/**
 * Google Consent Mode v2 — Static Syntax Scanner CLI
 * 
 * Open Source Developer Utility
 * License: MIT
 */

import fs from 'fs';

const V2_PARAMS = [
  'ad_storage',
  'analytics_storage',
  'ad_user_data',
  'ad_personalization'
];

async function fetchHtml(target) {
  if (target.startsWith('http://') || target.startsWith('https://')) {
    console.log(`[🔍 Fetching] ${target}...`);
    const res = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return await res.text();
  } else {
    return fs.readFileSync(target, 'utf8');
  }
}

export function analyzeHtml(html) {
  const issues = [];
  const passes = [];
  const warnings = [];

  const hasConsentDefault = /gtag\s*\(\s*['"]consent['"]\s*,\s*['"]default['"]/i.test(html);
  if (!hasConsentDefault) {
    issues.push({
      code: 'ERR_NO_CONSENT_DEFAULT',
      title: 'Missing gtag("consent", "default") declaration in static source',
      detail: 'The string gtag("consent", "default", ...) was not found in the inspected HTML.'
    });
  } else {
    passes.push('Consent default call detected in source text');
  }

  const missingParams = [];
  for (const p of V2_PARAMS) {
    const paramRegex = new RegExp(`['"]?${p}['"]?\\s*:`, 'i');
    if (!paramRegex.test(html)) {
      missingParams.push(p);
    }
  }

  if (missingParams.length > 0) {
    issues.push({
      code: 'ERR_MISSING_V2_PARAMS',
      title: `Missing parameter keys in text: ${missingParams.join(', ')}`,
      detail: 'Google Consent Mode v2 specification defines: ad_storage, analytics_storage, ad_user_data, ad_personalization.'
    });
  } else {
    passes.push('All 4 v2 parameter strings present in text (ad_storage, analytics_storage, ad_user_data, ad_personalization)');
  }

  const consentIndex = html.search(/gtag\s*\(\s*['"]consent['"]\s*,\s*['"]default['"]/i);
  const gtmIndex = html.search(/(googletagmanager\.com\/gtm\.js|googletagmanager\.com\/gtag\/js)/i);

  if (consentIndex !== -1 && gtmIndex !== -1) {
    if (gtmIndex < consentIndex) {
      issues.push({
        code: 'WARN_SCRIPT_ORDER',
        title: 'Static tag order: GTM script tag appears before consent default call in text',
        detail: 'Google recommends executing gtag consent default synchronously before the GTM container script is requested.'
      });
    } else {
      passes.push('Script order: Consent default appears before GTM script tag in text');
    }
  }

  return {
    isSyntaxValid: issues.length === 0,
    passes,
    issues,
    warnings
  };
}

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.log('Usage: node consent-validator.mjs <url-or-html-file>');
    process.exit(1);
  }

  try {
    const html = await fetchHtml(target);
    const result = analyzeHtml(html);

    console.log('\n============================================================');
    console.log('   Google Consent Mode v2 — Static Syntax Scanner           ');
    console.log('============================================================\n');
    console.log(`Audited Target: ${target}`);
    console.log(`Static Syntax Result: ${result.isSyntaxValid ? 'SYNTAX PASS (Text pattern check only)' : 'SYNTAX INCOMPLETE'}\n`);
    console.log('NOTE: Static code analysis does NOT verify runtime browser execution,');
    console.log('network collect pings (gcd parameter), or legal GDPR/ePrivacy compliance.\n');

    if (result.passes.length > 0) {
      console.log('--- PATTERNS DETECTED ---');
      result.passes.forEach(p => console.log(`  [PASS] ${p}`));
      console.log('');
    }

    if (result.issues.length > 0) {
      console.log('--- SYNTAX ISSUES / DISCREPANCIES ---');
      result.issues.forEach(iss => {
        console.log(`  [ISSUE] ${iss.title}`);
        console.log(`          ${iss.detail}\n`);
      });
    }

    console.log('============================================================');
    console.log('Reference documentation: https://developers.google.com/tag-platform/security/guides/consent');
    console.log('============================================================\n');

  } catch (err) {
    console.error('Scan failed:', err.message);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith('consent-validator.mjs')) {
  main();
}
