import type { APIRoute } from 'astro';
import { NodemailerDlbMailService } from '../../lib/dlb-mail';
import { normalizeClientIp } from '../../lib/dlb-initiative';
import {
  DlbRateLimiter,
  isHoneypotFilled,
  processDlbSubmission,
} from '../../lib/dlb-submission-service';
import type { DlbSubmissionServices } from '../../lib/dlb-submission-service';
import { GoogleSheetsDlbService } from '../../lib/google-sheets';

const MAX_BODY_BYTES = 64 * 1024;
const GENERIC_ERROR = 'حدث خطأ، يرجى المحاولة مرة أخرى.';
const ENV: Record<string, string | undefined> = {
  DLB_RATE_LIMIT_MAX: import.meta.env?.DLB_RATE_LIMIT_MAX,
  DLB_RATE_LIMIT_WINDOW_SECONDS: import.meta.env?.DLB_RATE_LIMIT_WINDOW_SECONDS,
  GOOGLE_SPREADSHEET_ID: import.meta.env?.GOOGLE_SPREADSHEET_ID,
  GOOGLE_SERVICE_ACCOUNT_EMAIL: import.meta.env?.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY: import.meta.env?.GOOGLE_PRIVATE_KEY,
  SMTP_HOST: import.meta.env?.SMTP_HOST,
  SMTP_PORT: import.meta.env?.SMTP_PORT,
  SMTP_USERNAME: import.meta.env?.SMTP_USERNAME,
  SMTP_PASSWORD: import.meta.env?.SMTP_PASSWORD,
  SMTP_FROM_NAME: import.meta.env?.SMTP_FROM_NAME,
  SMTP_FROM_EMAIL: import.meta.env?.SMTP_FROM_EMAIL,
};

function positiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const rateLimiter = new DlbRateLimiter(
  positiveInteger(ENV.DLB_RATE_LIMIT_MAX, 5),
  positiveInteger(ENV.DLB_RATE_LIMIT_WINDOW_SECONDS, 3600),
);

function jsonResponse(data: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

let services: DlbSubmissionServices | undefined;

function createServices() {
  services ??= {
    sheets: new GoogleSheetsDlbService({
      spreadsheetId: ENV.GOOGLE_SPREADSHEET_ID ?? '',
      serviceAccountEmail: ENV.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '',
      privateKey: ENV.GOOGLE_PRIVATE_KEY ?? '',
    }),
    mail: new NodemailerDlbMailService({
      host: ENV.SMTP_HOST ?? '',
      port: Number(ENV.SMTP_PORT ?? 0),
      username: ENV.SMTP_USERNAME ?? '',
      password: ENV.SMTP_PASSWORD ?? '',
      fromName: ENV.SMTP_FROM_NAME ?? '',
      fromEmail: ENV.SMTP_FROM_EMAIL ?? '',
    }),
    log(event: string, details: Record<string, unknown> = {}) {
      console.info('[dlb-initiative]', event, details);
    },
  };
  return services;
}

export const GET: APIRoute = () => jsonResponse(
  { success: false, message: 'الطريقة غير مسموح بها.' },
  405,
  { Allow: 'POST' },
);

export async function handleDlbInitiativePost(
  request: Request,
  clientAddress: string,
  servicesFactory: () => DlbSubmissionServices = createServices,
): Promise<Response> {
  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    return jsonResponse({ success: false, message: 'يجب إرسال البيانات بصيغة صحيحة.' }, 415);
  }

  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return jsonResponse({ success: false, message: GENERIC_ERROR }, 413);
  }

  let rawBody = '';
  let body: unknown;
  try {
    rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
      return jsonResponse({ success: false, message: GENERIC_ERROR }, 413);
    }
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ success: false, message: 'تعذّر قراءة البيانات. حاولي مرة أخرى.' }, 400);
  }

  if (isHoneypotFilled(body)) {
    return jsonResponse({ success: true }, 200);
  }

  const clientIp = normalizeClientIp(clientAddress);
  if (!rateLimiter.allow(clientIp)) {
    return jsonResponse({ success: false, message: 'تم إرسال محاولات كثيرة. حاولي مرة أخرى لاحقًا.' }, 429);
  }

  try {
    const outcome = await processDlbSubmission(
      body,
      {
        clientIp,
        userAgent: request.headers.get('user-agent') ?? '',
      },
      servicesFactory,
    );

    if (outcome.type === 'validation') {
      return jsonResponse({ success: false, errors: outcome.errors }, 422);
    }
    if (outcome.type === 'duplicate') {
      return jsonResponse({ success: false, duplicate: true }, 409);
    }
    return jsonResponse({ success: true, applicationId: outcome.applicationId }, 200);
  } catch {
    console.error('[dlb-initiative] submission_failure');
    return jsonResponse({ success: false, message: GENERIC_ERROR }, 500);
  }
}

export const POST: APIRoute = ({ request, clientAddress }) => (
  handleDlbInitiativePost(request, clientAddress)
);
