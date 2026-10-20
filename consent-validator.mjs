#!/usr/bin/env node

/**
 * ConsentModePro — Automated Diagnostic CLI Validator
 * 
 * Usage:
 *   node consent-validator.mjs https://example.com
 *   node consent-validator.mjs --file ./index.html
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

  // 1. Check for gtag consent default
  const hasConsentDefault = /gtag\s*\(\s*['"]consent['"]\s*,\s*['"]default['"]/i.test(html);
  if (!hasConsentDefault) {
    issues.push({
      code: 'ERR_NO_CONSENT_DEFAULT',
      title: 'Missing gtag("consent", "default") declaration',
      impact: 'CRITICAL: Google Ads and GA4 will not detect consent state, dropping conversion modeling and audience retention.',
      fix: 'Add the synchronous head-guard before any analytics tag.'
    });
  } else {
    passes.push('Consent default call detected: gtag("consent", "default", {...})');
  }

  // 2. Check for all 4 v2 mandatory parameters
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
      title: `Missing Mandatory Consent Mode v2 Parameters: ${missingParams.join(', ')}`,
      impact: 'CRITICAL: Google Consent Mode v2 strictly requires ad_user_data and ad_personalization. Without them, Google Ads flags the site as non-compliant in EEA/UK.',
      fix: `Ensure all 4 parameters are set in the default state: ${V2_PARAMS.join(', ')}`
    });
  } else {
    passes.push('All 4 mandatory Consent Mode v2 parameters are present (ad_storage, analytics_storage, ad_user_data, ad_personalization)');
  }

  // 3. Check for Race Conditions: Did consent default appear BEFORE GTM / gtag.js?
  const consentIndex = html.search(/gtag\s*\(\s*['"]consent['"]\s*,\s*['"]default['"]/i);
  const gtmIndex = html.search(/(googletagmanager\.com\/gtm\.js|googletagmanager\.com\/gtag\/js)/i);

  if (consentIndex !== -1 && gtmIndex !== -1) {
    if (gtmIndex < consentIndex) {
      issues.push({
        code: 'ERR_RACE_CONDITION',
        title: 'Race Condition Detected: Google Tag loads BEFORE consent default is set',
        impact: 'HIGH: The Google Tag fires its initial collect ping before reading your default consent state, sending an uninitialized "gcd" parameter.',
        fix: 'Move the consent default initialization snippet to the very top of <head>, strictly above any GTM or gtag.js script.'
      });
    } else {
      passes.push('Order verification passed: Consent default executes before Google Tag Manager container loads');
    }
  }

  // 4. Check for wait_for_update
  const hasWaitForUpdate = /['"]?wait_for_update['"]?\s*:\s*\d+/i.test(html);
  if (hasWaitForUpdate) {
    passes.push('wait_for_update parameter configured (allows asynchronous CMP resolution window)');
  } else if (hasConsentDefault) {
    warnings.push({
      code: 'WARN_NO_WAIT_FOR_UPDATE',
      title: 'wait_for_update is not set',
      recommendation: 'Adding "wait_for_update: 500" gives the banner 500ms to resolve prior user consent without delaying critical tags.'
    });
  }

  // 5. Check for re-consent / preferences trigger
  const hasReconsentHook = /openConsentPreferences|cookie-settings|privacy-preferences/i.test(html);
  if (hasReconsentHook) {
    passes.push('Re-consent / preferences trigger detected');
  } else {
    warnings.push({
      code: 'WARN_NO_RECONSENT_LINK',
      title: 'No obvious re-consent trigger found in page source',
      recommendation: 'Under GDPR/UK regulations, users must be able to change or withdraw their consent at any time via a link in the footer or settings.'
    });
  }

  return {
    isCompliant: issues.length === 0,
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
    console.log('      ConsentModePro — Diagnostic Audit Report              ');
    console.log('============================================================\n');
    console.log(`Audited Target: ${target}`);
    console.log(`Status: ${result.isCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT / WARNINGS DETECTED'}\n`);

    if (result.passes.length > 0) {
      console.log('--- VERIFIED PASSES ---');
      result.passes.forEach(p => console.log(`  [PASS] ${p}`));
      console.log('');
    }

    if (result.issues.length > 0) {
      console.log('--- CRITICAL ISSUES TO FIX ---');
      result.issues.forEach(iss => {
        console.log(`  [FAIL] ${iss.title}`);
        console.log(`         Impact: ${iss.impact}`);
        console.log(`         Solution: ${iss.fix}\n`);
      });
    }

    if (result.warnings.length > 0) {
      console.log('--- OPTIMIZATION RECOMMENDATIONS ---');
      result.warnings.forEach(w => {
        console.log(`  [WARN] ${w.title}`);
        console.log(`         Recommendation: ${w.recommendation}\n`);
      });
    }

    console.log('============================================================');
    if (!result.isCompliant) {
      console.log('Remediation: Deploy the ConsentModePro Zero-Bloat Guard to fix all issues in 3 minutes.');
      console.log('Bundle: https://whop.com');
    } else {
      console.log('Your website meets core Google Consent Mode v2 technical requirements.');
    }
    console.log('============================================================\n');

  } catch (err) {
    console.error('Audit failed:', err.message);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith('consent-validator.mjs')) {
  main();
}
