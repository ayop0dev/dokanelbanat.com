import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatApplicationId,
  normalizeClientIp,
  normalizeEgyptianWhatsApp,
  validateDlbSubmission,
} from '../src/lib/dlb-initiative';
import {
  DlbRateLimiter,
  isHoneypotFilled,
  processDlbSubmission,
} from '../src/lib/dlb-submission-service';
import type { DlbMailService } from '../src/lib/dlb-mail';
import { buildAdminMessage, buildApplicantMessage } from '../src/lib/dlb-mail';
import {
  buildDlbSheetRow,
  DlbHeaderSchemaMismatchError,
  DLB_SHEET_HEADERS,
  ensureDlbSheetHeaders,
  getNextApplicationSequence,
  resolveGooglePrivateKey,
} from '../src/lib/google-sheets';
import type { DlbHeaderStore, DlbSheetRow, DlbSheetsService } from '../src/lib/google-sheets';
import {
  GET as apiGet,
  handleDlbInitiativePost,
  POST as apiPost,
} from '../src/pages/api/dlb-initiative';

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    full_name: '  سارة   أحمد  ',
    age: 24,
    governorate: 'القاهرة',
    study_work_status: 'بشتغل',
    study_work_details: 'مصممة جرافيك',
    proud_achievement: 'بدأت أتعلم بنفسي.',
    initiative_reason: 'نفسي أبدأ مشروعي.',
    expected_outcome: 'خطة واضحة وخبرة عملية.',
    if_not_accepted: 'هكمل تعلم وتجربة.',
    has_project_idea: 'أيوه',
    project_idea: 'منتجات ورقية مصنوعة محليًا.',
    desired_field: '',
    biggest_fear: 'عدم الوصول للعملاء.',
    failure_story: 'جربت مشروعًا صغيرًا ولم ينجح، وتعلمت أهمية البحث.',
    idea_change_reaction: 'هراجع الأدلة وأغيّر الفكرة لو ده الأفضل.',
    biggest_strength: 'الاستمرار.',
    trait_to_improve: 'إدارة الوقت.',
    future_letter: 'عزيزتي سارة... أتمنى تكوني بنيتي مشروعًا يشبهك.',
    whatsapp: '010 1234 5678',
    email: '  SARA@example.com ',
    privacy_accepted: true,
    website: '',
    ...overrides,
  };
}

class MockSheets implements DlbSheetsService {
  headerRow: unknown[] = [...DLB_SHEET_HEADERS];
  headerWrites = 0;
  failHeaderWrite = false;
  applicationIds: string[] = [];
  emails = new Set<string>();
  whatsapps = new Set<string>();
  appended: DlbSheetRow[] = [];
  statuses: Array<{ rowNumber: number; status: 'Sent' | 'Failed' }> = [];
  failRead = false;

  async readState() {
    if (this.failRead) throw new Error('sheet unavailable');
    await ensureDlbSheetHeaders({
      readHeader: async () => [...this.headerRow],
      writeHeader: async (headers) => {
        if (this.failHeaderWrite) throw new Error('header write failed');
        this.headerWrites += 1;
        this.headerRow = [...headers];
      },
    });
    return {
      applicationIds: [...this.applicationIds],
      emails: new Set(this.emails),
      whatsapps: new Set(this.whatsapps),
    };
  }

  async appendSubmission(row: DlbSheetRow) {
    this.appended.push(row);
    this.applicationIds.push(row.applicationId);
    this.emails.add(row.submission.email);
    this.whatsapps.add(row.submission.whatsapp);
    return this.appended.length + 1;
  }

  async updateEmailStatus(rowNumber: number, status: 'Sent' | 'Failed') {
    this.statuses.push({ rowNumber, status });
  }
}

class MockHeaderStore implements DlbHeaderStore {
  writes = 0;
  reads = 0;
  failWrite = false;

  constructor(public row: unknown[]) {}

  async readHeader() {
    this.reads += 1;
    return [...this.row];
  }

  async writeHeader(headers: readonly string[]) {
    if (this.failWrite) throw new Error('header write failed');
    this.writes += 1;
    this.row = [...headers];
  }
}

class MockMail implements DlbMailService {
  applicantCalls = 0;
  adminCalls = 0;
  failApplicant = false;
  failAdmin = false;

  async sendApplicantConfirmation() {
    this.applicantCalls += 1;
    if (this.failApplicant) throw new Error('smtp unavailable');
  }

  async sendAdminNotification() {
    this.adminCalls += 1;
    if (this.failAdmin) throw new Error('smtp unavailable');
  }
}

const context = { clientIp: '203.0.113.10', userAgent: 'DLB test agent' };
const fixedNow = () => new Date('2026-08-01T12:00:00.000Z');
const testPrivateKey = [
  '-----BEGIN PRIVATE KEY-----',
  'ZmFrZS1wZW0ta2V5',
  '-----END PRIVATE KEY-----',
].join('\n');

test('validates and normalizes a complete application', () => {
  const result = validateDlbSubmission(validInput());
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.data.full_name, 'سارة أحمد');
  assert.equal(result.data.email, 'sara@example.com');
  assert.equal(result.data.whatsapp, '+201012345678');
  assert.equal(result.data.desired_field, '');
});

test('validates required, length, age, email, WhatsApp, and privacy fields', () => {
  const result = validateDlbSubmission(validInput({
    full_name: 'س',
    age: 15.5,
    governorate: ' ',
    proud_achievement: 'x'.repeat(501),
    whatsapp: '12345',
    email: 'not-an-email',
    privacy_accepted: false,
  }));
  assert.equal(result.success, false);
  if (result.success) return;
  assert.deepEqual(Object.keys(result.errors).sort(), [
    'age', 'email', 'full_name', 'governorate', 'privacy_accepted', 'proud_achievement', 'whatsapp',
  ].sort());
});

test('requires only the conditional project answer selected by the applicant', () => {
  const searching = validateDlbSubmission(validInput({
    has_project_idea: 'لسه بدور على فكرة',
    project_idea: 'must be discarded',
    desired_field: 'التصميم المستدام لأنه قريب من خبرتي.',
  }));
  assert.equal(searching.success, true);
  if (!searching.success) return;
  assert.equal(searching.data.project_idea, '');
  assert.equal(searching.data.desired_field, 'التصميم المستدام لأنه قريب من خبرتي.');
});

test('normalizes supported Egyptian WhatsApp formats', () => {
  assert.equal(normalizeEgyptianWhatsApp('010-1234-5678'), '+201012345678');
  assert.equal(normalizeEgyptianWhatsApp('+20 10 1234 5678'), '+201012345678');
  assert.equal(normalizeEgyptianWhatsApp('+971501234567'), null);
});

test('accepts public client addresses and treats proxy-local addresses as unknown', () => {
  assert.equal(normalizeClientIp('203.0.113.10'), '203.0.113.10');
  assert.equal(normalizeClientIp('127.0.0.1'), 'unknown');
  assert.equal(normalizeClientIp('::1'), 'unknown');
});

test('generates sequential application IDs and rejects overflow', () => {
  assert.equal(getNextApplicationSequence(['DLB-2026-0002', 'DLB-2026-0010']), 11);
  assert.equal(formatApplicationId(11), 'DLB-2026-0011');
  assert.throws(() => formatApplicationId(10000));
});

test('maps the exact required Google Sheets column order', () => {
  assert.equal(DLB_SHEET_HEADERS.length, 28);
  const validation = validateDlbSubmission(validInput());
  assert.equal(validation.success, true);
  if (!validation.success) return;
  const row = buildDlbSheetRow({
    applicationId: 'DLB-2026-0001',
    submittedAt: '2026-08-01T12:00:00.000Z',
    emailStatus: 'Pending',
    submission: validation.data,
    userAgent: 'agent',
    clientIp: '203.0.113.10',
  });
  assert.equal(row.length, DLB_SHEET_HEADERS.length);
  assert.equal(row[0], 'DLB-2026-0001');
  assert.equal(row[3], 'Pending');
  assert.equal(row[22], '+201012345678');
  assert.equal(row[23], 'sara@example.com');
  assert.equal(row[27], '/dlb-initiative');
});

test('resolves a valid Base64-encoded PEM private key', () => {
  const encoded = Buffer.from(testPrivateKey, 'utf8').toString('base64');
  assert.equal(resolveGooglePrivateKey('-----BEGIN PRIVATE KEY-----wrong-----END PRIVATE KEY-----', encoded), testPrivateKey);
});

test('rejects malformed Base64 private keys without exposing their value', () => {
  const secretFragment = 'SENSITIVE_PRIVATE_KEY_FRAGMENT';
  const malformed = `%%%${secretFragment}`;
  assert.throws(
    () => resolveGooglePrivateKey(undefined, malformed),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.doesNotMatch(error.message, new RegExp(secretFragment));
      return true;
    },
  );
});

test('gives Base64 private key priority over the direct environment value', () => {
  const encoded = Buffer.from(testPrivateKey, 'utf8').toString('base64');
  const directValue = '-----BEGIN PRIVATE KEY-----\nwrong\n-----END PRIVATE KEY-----';
  assert.equal(resolveGooglePrivateKey(directValue, encoded), testPrivateKey);
});

test('normalizes the existing literal-newline private key fallback', () => {
  const literalValue = '-----BEGIN PRIVATE KEY-----\\nZmFrZS1wZW0ta2V5\\n-----END PRIVATE KEY-----';
  assert.equal(resolveGooglePrivateKey(literalValue), testPrivateKey);
});

test('preserves the existing multiline PEM private key fallback', () => {
  assert.equal(resolveGooglePrivateKey(testPrivateKey), testPrivateKey);
});

test('empty row 1 creates and verifies the exact 28 headers', async () => {
  const store = new MockHeaderStore([]);
  await ensureDlbSheetHeaders(store);
  assert.deepEqual(store.row, [...DLB_SHEET_HEADERS]);
  assert.equal(store.writes, 1);
  assert.equal(store.reads, 2);
});

test('exact existing headers are verified without rewriting row 1', async () => {
  const store = new MockHeaderStore([...DLB_SHEET_HEADERS]);
  await ensureDlbSheetHeaders(store);
  assert.equal(store.writes, 0);
  assert.equal(store.reads, 1);
});

test('partial headers fail without overwriting row 1', async () => {
  const original = DLB_SHEET_HEADERS.slice(0, 5);
  const store = new MockHeaderStore([...original]);
  await assert.rejects(ensureDlbSheetHeaders(store), DlbHeaderSchemaMismatchError);
  assert.deepEqual(store.row, original);
  assert.equal(store.writes, 0);
});

test('reordered headers fail without overwriting row 1', async () => {
  const reordered = [...DLB_SHEET_HEADERS];
  [reordered[0], reordered[1]] = [reordered[1], reordered[0]];
  const store = new MockHeaderStore(reordered);
  await assert.rejects(ensureDlbSheetHeaders(store), DlbHeaderSchemaMismatchError);
  assert.deepEqual(store.row, reordered);
  assert.equal(store.writes, 0);
});

test('extra conflicting header cells fail without overwriting row 1', async () => {
  const conflicting = [...DLB_SHEET_HEADERS, 'Unexpected Column'];
  const store = new MockHeaderStore(conflicting);
  await assert.rejects(ensureDlbSheetHeaders(store), DlbHeaderSchemaMismatchError);
  assert.deepEqual(store.row, conflicting);
  assert.equal(store.writes, 0);
});

test('header-write failure returns a safe generic API error without applicant persistence', async () => {
  const sheets = new MockSheets();
  const mail = new MockMail();
  sheets.headerRow = [];
  sheets.failHeaderWrite = true;
  const response = await handleDlbInitiativePost(
    new Request('http://localhost/api/dlb-initiative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validInput()),
    }),
    '203.0.113.26',
    () => ({ sheets, mail, now: fixedNow }),
  );
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    success: false,
    message: 'حدث خطأ، يرجى المحاولة مرة أخرى.',
  });
  assert.deepEqual(sheets.headerRow, []);
  assert.equal(sheets.appended.length, 0);
  assert.equal(mail.applicantCalls + mail.adminCalls, 0);
});

test('header helper propagates a write failure without mutating row 1', async () => {
  const store = new MockHeaderStore([]);
  store.failWrite = true;
  await assert.rejects(ensureDlbSheetHeaders(store), /header write failed/);
  assert.deepEqual(store.row, []);
  assert.equal(store.writes, 0);
});

test('persists a valid application, sends both emails, and records Sent', async () => {
  const sheets = new MockSheets();
  const mail = new MockMail();
  const outcome = await processDlbSubmission(validInput(), context, { sheets, mail, now: fixedNow });
  assert.deepEqual(outcome, { type: 'success', applicationId: 'DLB-2026-0001' });
  assert.equal(sheets.appended.length, 1);
  assert.equal(mail.applicantCalls, 1);
  assert.equal(mail.adminCalls, 1);
  assert.deepEqual(sheets.statuses, [{ rowNumber: 2, status: 'Sent' }]);
});

test('rejects duplicate email or WhatsApp without writing or emailing', async (t) => {
  for (const duplicate of ['email', 'whatsapp'] as const) {
    await t.test(duplicate, async () => {
      const sheets = new MockSheets();
      const mail = new MockMail();
      if (duplicate === 'email') sheets.emails.add('sara@example.com');
      else sheets.whatsapps.add('+201012345678');
      const outcome = await processDlbSubmission(validInput(), context, { sheets, mail, now: fixedNow });
      assert.deepEqual(outcome, { type: 'duplicate' });
      assert.equal(sheets.appended.length, 0);
      assert.equal(mail.applicantCalls + mail.adminCalls, 0);
    });
  }
});

test('serializes simultaneous duplicate submissions', async () => {
  const sheets = new MockSheets();
  const mail = new MockMail();
  const results = await Promise.all([
    processDlbSubmission(validInput(), context, { sheets, mail, now: fixedNow }),
    processDlbSubmission(validInput(), context, { sheets, mail, now: fixedNow }),
  ]);
  assert.equal(results.filter((result) => result.type === 'success').length, 1);
  assert.equal(results.filter((result) => result.type === 'duplicate').length, 1);
  assert.equal(sheets.appended.length, 1);
});

test('serializes two first submissions through one header initialization and unique IDs', async () => {
  const sheets = new MockSheets();
  const mail = new MockMail();
  sheets.headerRow = [];
  const results = await Promise.all([
    processDlbSubmission(validInput(), context, { sheets, mail, now: fixedNow }),
    processDlbSubmission(validInput({
      full_name: 'نور أحمد',
      email: 'nour@example.com',
      whatsapp: '01112345678',
    }), context, { sheets, mail, now: fixedNow }),
  ]);
  assert.deepEqual(sheets.headerRow, [...DLB_SHEET_HEADERS]);
  assert.equal(sheets.headerWrites, 1);
  assert.deepEqual(
    results.map((result) => result.type === 'success' ? result.applicationId : '').sort(),
    ['DLB-2026-0001', 'DLB-2026-0002'],
  );
  assert.deepEqual(sheets.applicationIds, ['DLB-2026-0001', 'DLB-2026-0002']);
});

test('schema mismatch logs safely and writes no applicant data before verification', async () => {
  const sheets = new MockSheets();
  const mail = new MockMail();
  const logs: Array<{ event: string; details?: Record<string, unknown> }> = [];
  sheets.headerRow = ['Application ID'];
  await assert.rejects(
    processDlbSubmission(validInput(), context, {
      sheets,
      mail,
      now: fixedNow,
      log: (event, details) => logs.push({ event, details }),
    }),
    DlbHeaderSchemaMismatchError,
  );
  assert.equal(sheets.headerWrites, 0);
  assert.equal(sheets.appended.length, 0);
  assert.equal(mail.applicantCalls + mail.adminCalls, 0);
  assert.deepEqual(logs, [{ event: 'header_schema_mismatch', details: undefined }]);
});

test('aborts before email when Google Sheets fails', async () => {
  const sheets = new MockSheets();
  const mail = new MockMail();
  sheets.failRead = true;
  await assert.rejects(processDlbSubmission(validInput(), context, { sheets, mail, now: fixedNow }));
  assert.equal(mail.applicantCalls + mail.adminCalls, 0);
});

test('keeps the application and records Failed when applicant email fails', async () => {
  const sheets = new MockSheets();
  const mail = new MockMail();
  mail.failApplicant = true;
  const outcome = await processDlbSubmission(validInput(), context, { sheets, mail, now: fixedNow });
  assert.equal(outcome.type, 'success');
  assert.equal(mail.adminCalls, 1);
  assert.equal(sheets.statuses[0]?.status, 'Failed');
});

test('keeps the application and records Sent when only admin email fails', async () => {
  const sheets = new MockSheets();
  const mail = new MockMail();
  mail.failAdmin = true;
  const outcome = await processDlbSubmission(validInput(), context, { sheets, mail, now: fixedNow });
  assert.equal(outcome.type, 'success');
  assert.equal(sheets.statuses[0]?.status, 'Sent');
});

test('email templates contain the application ID and escape applicant HTML', () => {
  const validation = validateDlbSubmission(validInput({ full_name: '<سارة>' }));
  assert.equal(validation.success, true);
  if (!validation.success) return;
  const applicant = buildApplicantMessage('DLB-2026-0042', validation.data);
  const admin = buildAdminMessage('DLB-2026-0042', '2026-08-01T12:00:00.000Z', validation.data);
  assert.match(applicant.text, /DLB-2026-0042/);
  assert.match(applicant.html, /&lt;سارة&gt;/);
  assert.match(admin.text, /DLB-2026-0042/);
});

test('honeypot detection is silent and rate limiting enforces its window', () => {
  assert.equal(isHoneypotFilled({ website: 'spam' }), true);
  assert.equal(isHoneypotFilled({ website: '' }), false);
  let now = 0;
  const limiter = new DlbRateLimiter(2, 60, () => now);
  assert.equal(limiter.allow('203.0.113.10'), true);
  assert.equal(limiter.allow('203.0.113.10'), true);
  assert.equal(limiter.allow('203.0.113.10'), false);
  now = 60_001;
  assert.equal(limiter.allow('203.0.113.10'), true);
});

test('API rejects GET and non-JSON requests', async () => {
  const getResponse = await apiGet({} as never);
  assert.equal(getResponse.status, 405);
  assert.equal(getResponse.headers.get('Allow'), 'POST');

  const postResponse = await apiPost({
    request: new Request('http://localhost/api/dlb-initiative', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'invalid',
    }),
    clientAddress: '203.0.113.20',
  } as never);
  assert.equal(postResponse.status, 415);
});

test('API rejects malformed and oversized JSON requests', async () => {
  const malformedResponse = await apiPost({
    request: new Request('http://localhost/api/dlb-initiative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    }),
    clientAddress: '203.0.113.24',
  } as never);
  assert.equal(malformedResponse.status, 400);

  const oversizedResponse = await apiPost({
    request: new Request('http://localhost/api/dlb-initiative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: 'x'.repeat((64 * 1024) + 1) }),
    }),
    clientAddress: '203.0.113.25',
  } as never);
  assert.equal(oversizedResponse.status, 413);
});

test('API maps validation errors and silently accepts honeypot submissions', async () => {
  const invalidResponse = await apiPost({
    request: new Request('http://localhost/api/dlb-initiative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }),
    clientAddress: '203.0.113.21',
  } as never);
  assert.equal(invalidResponse.status, 422);
  const invalidBody = await invalidResponse.json() as { errors: Record<string, string> };
  assert.equal(typeof invalidBody.errors.email, 'string');

  const honeypotResponse = await apiPost({
    request: new Request('http://localhost/api/dlb-initiative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ website: 'bot-filled-field' }),
    }),
    clientAddress: '203.0.113.22',
  } as never);
  assert.equal(honeypotResponse.status, 200);
  assert.deepEqual(await honeypotResponse.json(), { success: true });
});

test('API returns a generic internal error when server integrations are unconfigured', async () => {
  const response = await apiPost({
    request: new Request('http://localhost/api/dlb-initiative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'test' },
      body: JSON.stringify(validInput()),
    }),
    clientAddress: '203.0.113.23',
  } as never);
  assert.equal(response.status, 500);
  const body = await response.json() as Record<string, unknown>;
  assert.deepEqual(body, { success: false, message: 'حدث خطأ، يرجى المحاولة مرة أخرى.' });
});

test('API rate limits the sixth request from one public client IP', async () => {
  let lastResponse: Response | undefined;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    lastResponse = await apiPost({
      request: new Request('http://localhost/api/dlb-initiative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
      clientAddress: '203.0.113.30',
    } as never);
  }
  assert.equal(lastResponse?.status, 429);
});

test('frontend source contains all sections, counters, progress, loading, and accessible status regions', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../src/pages/dlb-initiative.astro', import.meta.url), 'utf8');
  const headings = ['التعارف', 'ليه المبادرة؟', 'المشروع', 'شخصيتك', 'رسالة لنفسك', 'بيانات التواصل', 'الموافقة'];
  let previous = -1;
  for (const heading of headings) {
    const index = source.indexOf(`>${heading}<`);
    assert.ok(index > previous, `${heading} should appear in the required order`);
    previous = index;
  }
  assert.equal((source.match(/<textarea\b/g) ?? []).length, 13);
  assert.equal((source.match(/data-counter-for=/g) ?? []).length, 13);
  assert.match(source, /<h1 id="dlb-page-title">100 دكان لـ100 بنت<\/h1>/);
  assert.match(source, /font-size: clamp\(2rem, 10vw, 4rem\);/);
  assert.match(source, /white-space: nowrap;/);
  assert.match(source, /role="progressbar"/);
  assert.match(source, /id="dlb-progress-sentinel"/);
  assert.match(source, /new IntersectionObserver/);
  assert.match(source, /\.dlb-progress\.is-fixed\s*{[^}]*position: fixed;[^}]*inset-block-start: 0;/s);
  assert.match(source, /جارٍ إرسال طلبك\.\.\./);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /يوجد طلب مسجل بالفعل/);
  assert.match(source, /id="dlb-success"/);
});

test('frontend form CSS remains shrink-safe, equal-column, and contact-row aligned', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../src/pages/dlb-initiative.astro', import.meta.url), 'utf8');

  assert.match(
    source,
    /\.dlb-form :is\(input, select, textarea, button\)\s*\{[^}]*box-sizing: border-box;[^}]*max-width: 100%;[^}]*min-width: 0;/s,
  );
  assert.match(source, /\.dlb-fields--two\s*\{\s*grid-template-columns: minmax\(0, 1fr\);\s*\}/);
  assert.match(
    source,
    /\.dlb-fields--two,\s*\.dlb-radio-options\s*\{\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);\s*\}/,
  );
  assert.doesNotMatch(
    source,
    /\.dlb-form \.(?:ds-input|ds-select)[^{]*\{[^}]*width:\s*\d+px/s,
  );

  assert.match(source, /class="dlb-fields dlb-fields--two dlb-contact-grid"/);
  assert.equal((source.match(/class="ds-form-group dlb-contact-field"/g) ?? []).length, 2);
  assert.equal((source.match(/class="dlb-contact-field__support"/g) ?? []).length, 2);
  assert.match(source, /\.dlb-contact-field\s*\{[^}]*grid-row: span 3;[^}]*grid-template-rows: subgrid;/s);

  assert.match(source, /id="dlb-whatsapp"[^>]*aria-describedby="dlb-whatsapp-helper dlb-whatsapp-error"/);
  assert.match(source, /id="dlb-email"[^>]*aria-describedby="dlb-email-error"/);
  assert.match(source, /id="dlb-whatsapp-error"[^>]*role="alert"[^>]*aria-live="assertive"/);
  assert.match(source, /id="dlb-email-error"[^>]*role="alert"[^>]*aria-live="assertive"/);
});
