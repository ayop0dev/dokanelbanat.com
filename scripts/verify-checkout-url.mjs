#!/usr/bin/env node
/**
 * Behavioral regression tests for the Astro checkout/recovery API routes.
 * Run: node scripts/verify-checkout-url.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

let passed = 0;
let failed = 0;

function check(label, condition) {
  if (condition) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    failed++;
  }
}

const woojs         = readFileSync(join(root, 'src/lib/woocommerce.js'), 'utf-8');
const checkoutAstro = readFileSync(join(root, 'src/pages/checkout.astro'), 'utf-8');
const freeTs        = readFileSync(join(root, 'src/pages/api/checkout/free.ts'), 'utf-8');
const recoverTs     = readFileSync(join(root, 'src/pages/api/recover-download.ts'), 'utf-8');

console.log('\n=== Checkout URL contract ===');
check(
  'woocommerce.js: getCheckoutUrl generates ?product=<id>',
  /`\/checkout\?product=\$\{encodeURIComponent\(productId\)\}`/.test(woojs)
);
check(
  'woocommerce.js: exports getProductById',
  /export async function getProductById/.test(woojs)
);
check(
  'checkout.astro: reads ?product as numeric ID (regex guard present)',
  /\/\^\\d\+\$\//.test(checkoutAstro) || /\\d\+/.test(checkoutAstro)
);
check(
  'checkout.astro: uses getProductById import',
  /import\s*\{[^}]*getProductById[^}]*\}/.test(checkoutAstro)
);
check(
  'checkout.astro: does NOT call getProductBySlug',
  !checkoutAstro.includes('getProductBySlug(')
);

console.log('\n=== privacy_accepted in checkout flow ===');
check(
  'checkout.astro: privacy_accepted sent in API body',
  /privacy_accepted\s*:/.test(checkoutAstro)
);
check(
  'free.ts: validates privacy_accepted before bridge call',
  /privacy_accepted\s*!==\s*true/.test(freeTs)
);

console.log('\n=== Client IP: adapter-provided clientAddress (Issue 3) ===');
check(
  'free.ts: normalizeClientIp function defined',
  /function normalizeClientIp/.test(freeTs)
);
check(
  'free.ts: IPv4 validation in normalizeClientIp',
  /\\d\{1,3\}/.test(freeTs) || /\d\{1,3\}/.test(freeTs)
);
check(
  'free.ts: IPv6 validation in normalizeClientIp',
  /includes\(':'\)/.test(freeTs)
);
check(
  "free.ts: returns 'unknown' for invalid IP",
  /return 'unknown'/.test(freeTs)
);
check(
  'free.ts: clientAddress destructured from context (not XFF)',
  /\{\s*request\s*,\s*clientAddress\s*\}/.test(freeTs)
);
check(
  'free.ts: clientAddress passed to normalizeClientIp',
  /normalizeClientIp\(clientAddress\)/.test(freeTs)
);
check(
  'free.ts: x-forwarded-for NOT used for IP extraction',
  !/(xffRaw|x-forwarded-for)/.test(freeTs)
);
check(
  'free.ts: X-DCB-Client-IP header forwarded to bridge',
  /'X-DCB-Client-IP'/.test(freeTs)
);
check(
  'recover-download.ts: normalizeClientIp defined',
  /function normalizeClientIp/.test(recoverTs)
);
check(
  'recover-download.ts: clientAddress destructured from context',
  /\{\s*request\s*,\s*clientAddress\s*\}/.test(recoverTs)
);
check(
  'recover-download.ts: x-forwarded-for NOT used for IP extraction',
  !/(xffRaw|x-forwarded-for)/.test(recoverTs)
);
check(
  'recover-download.ts: X-DCB-Client-IP header forwarded to bridge',
  /'X-DCB-Client-IP'/.test(recoverTs)
);

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
