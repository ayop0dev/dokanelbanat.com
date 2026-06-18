import type { APIRoute } from 'astro';

const WOO_BACKEND_URL = import.meta.env.WOO_BACKEND_URL as string | undefined;
const DB_BRIDGE_SECRET = import.meta.env.DB_BRIDGE_SECRET as string | undefined;
const TIMEOUT_MS = 30_000;

const TOKEN_RE = /^[a-f0-9]{64}$/;

export const GET: APIRoute = async ({ params }) => {
  const token = params.token ?? '';

  if (!TOKEN_RE.test(token)) {
    return expiredPage();
  }

  if (!WOO_BACKEND_URL || !DB_BRIDGE_SECRET) {
    return errorPage();
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let bridgeRes: Response;
  try {
    bridgeRes = await fetch(`${WOO_BACKEND_URL}/download/${encodeURIComponent(token)}`, {
      signal: controller.signal,
      headers: { 'X-DCB-Secret': DB_BRIDGE_SECRET },
    });
  } catch {
    clearTimeout(timer);
    return errorPage();
  }
  clearTimeout(timer);

  if (bridgeRes.status === 404 || bridgeRes.status === 410) {
    return expiredPage();
  }

  if (!bridgeRes.ok || !bridgeRes.body) {
    return errorPage();
  }

  const contentType = bridgeRes.headers.get('Content-Type') ?? 'application/octet-stream';
  const contentDisposition = bridgeRes.headers.get('Content-Disposition') ?? 'attachment';
  const contentLength = bridgeRes.headers.get('Content-Length');

  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'Content-Disposition': contentDisposition,
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'X-Robots-Tag': 'noindex',
  };
  if (contentLength) headers['Content-Length'] = contentLength;

  return new Response(bridgeRes.body, { status: 200, headers });
};

function expiredPage(): Response {
  return new Response(
    `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>رابط منتهي الصلاحية - دكان البنات</title></head><body><h1>رابط التحميل منتهي الصلاحية أو غير صالح</h1><p>يمكنك <a href="/recover-download">استعادة طلبك</a> باستخدام رقم الطلب والبريد الإلكتروني.</p></body></html>`,
    { status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

function errorPage(): Response {
  return new Response(
    `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>خطأ - دكان البنات</title></head><body><h1>حدث خطأ</h1><p>يرجى المحاولة مرة أخرى. إذا استمرت المشكلة، <a href="/recover-download">استعيدي طلبك</a>.</p></body></html>`,
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
