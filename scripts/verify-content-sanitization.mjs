#!/usr/bin/env node
/**
 * Verification tests for the shared content sanitization utilities.
 * Run: npm run verify:content
 */

import { toPlainText, sanitizeRichHtml } from '../src/lib/sanitize-content.js';

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

// ─── sanitizeRichHtml ──────────────────────────────────────────────────────

console.log('\n=== sanitizeRichHtml: script removal ===');

check(
  '<script> tags are removed',
  !sanitizeRichHtml('<p>hello</p><script>alert(1)</script>').includes('<script')
);

check(
  'inline script content is removed',
  !sanitizeRichHtml('<script>alert(1)</script><p>text</p>').includes('alert(1)')
);

console.log('\n=== sanitizeRichHtml: event-handler removal ===');

check(
  'onerror on img is stripped',
  !sanitizeRichHtml('<img src="x" onerror="alert(1)">').includes('onerror')
);

check(
  'onclick is stripped',
  !sanitizeRichHtml('<p onclick="alert(1)">text</p>').includes('onclick')
);

console.log('\n=== sanitizeRichHtml: URL rejection ===');

check(
  'javascript: href is removed',
  !sanitizeRichHtml('<a href="javascript:alert(1)">link</a>').includes('javascript:')
);

check(
  'protocol-relative href is rejected',
  !sanitizeRichHtml('<a href="//evil.example/path">link</a>').includes('href=')
);

check(
  'data:text/html src is removed',
  !sanitizeRichHtml('<img src="data:text/html,<script>alert(1)</script>">').includes('data:text')
);

check(
  'data:image src is removed (no unsafe data URLs allowed)',
  !sanitizeRichHtml('<img src="data:image/png;base64,abc">').includes('data:image')
);

check(
  'protocol-relative image src is rejected',
  !sanitizeRichHtml('<img src="//evil.example/image.jpg">').includes('<img')
);

console.log('\n=== sanitizeRichHtml: safe content preserved ===');

check(
  'valid Arabic paragraph text survives',
  sanitizeRichHtml('<p>السلام عليكم ومرحبا بكم</p>').includes('السلام عليكم')
);

check(
  'headings survive',
  sanitizeRichHtml('<h2>عنوان</h2><h3>عنوان فرعي</h3>').includes('<h2>') &&
  sanitizeRichHtml('<h2>عنوان</h2><h3>عنوان فرعي</h3>').includes('<h3>')
);

check(
  'lists survive',
  sanitizeRichHtml('<ul><li>بند</li></ul>').includes('<ul>') &&
  sanitizeRichHtml('<ul><li>بند</li></ul>').includes('<li>')
);

check(
  'safe https link survives',
  sanitizeRichHtml('<a href="https://example.com">رابط</a>').includes('href="https://example.com"')
);

check(
  'root-relative proxy image URL survives',
  sanitizeRichHtml('<img src="/api/image?url=%2Fwp-content%2Fuploads%2Ftest.jpg" alt="صورة">').includes('/api/image')
);

check(
  'safe http image survives',
  sanitizeRichHtml('<img src="https://images.example.com/photo.jpg" alt="صورة">').includes('https://images.example.com')
);

console.log('\n=== sanitizeRichHtml: target="_blank" safety ===');

const blankLink = sanitizeRichHtml('<a href="https://example.com" target="_blank">رابط خارجي</a>');
check(
  'target="_blank" links get rel="noopener noreferrer"',
  blankLink.includes('rel="noopener noreferrer"')
);

check(
  'target="_blank" link preserves href',
  blankLink.includes('href="https://example.com"')
);

console.log('\n=== toPlainText: HTML stripping ===');

check(
  'script tags become plain text (tag stripped)',
  !toPlainText('<script>alert(1)</script>عنوان').includes('<script>')
);

check(
  'HTML tags are removed from titles',
  toPlainText('<h1>عنوان المقال</h1>') === 'عنوان المقال'
);

check(
  'nested tags are stripped',
  toPlainText('<p><strong>نص <em>مهم</em></strong></p>') === 'نص مهم'
);

console.log('\n=== toPlainText: entity decoding ===');

check(
  'HTML entities are decoded correctly (&amp; → &)',
  toPlainText('<p>جمال &amp; بيزنس</p>') === 'جمال & بيزنس'
);

check(
  'numeric decimal entities decoded (&#39; → \')',
  toPlainText("it&#39;s") === "it's"
);

check(
  'numeric hex entities decoded (&#x2019; → ’)',
  toPlainText('it&#x2019;s') === 'it’s'
);

check(
  'entities are not double-encoded (& stays & after toPlainText)',
  toPlainText('&amp;') === '&'
);

console.log('\n=== toPlainText: Arabic text ===');

check(
  'Arabic text passes through unchanged',
  toPlainText('<p>السلام عليكم ومرحبا بكم في دكان البنات</p>') === 'السلام عليكم ومرحبا بكم في دكان البنات'
);

check(
  'Arabic mixed content extracts correctly',
  toPlainText('<h2>مجلة <em>دكان البنات</em></h2>') === 'مجلة دكان البنات'
);

console.log('\n=== toPlainText: WordPress proxy image URLs ===');

const proxyHtml = '<img src="/api/image?url=%2Fwp-content%2Fuploads%2Ftest.jpg" alt="صورة">';
check(
  'toPlainText on img tag gives empty string (no text content)',
  toPlainText(proxyHtml) === ''
);

const richWithProxy = sanitizeRichHtml('<p>نص</p><img src="/api/image?url=%2Fwp-content%2Fuploads%2Ftest.jpg" alt="صورة">');
check(
  'sanitizeRichHtml preserves root-relative proxy URL in img src',
  richWithProxy.includes('/api/image?url=')
);

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
