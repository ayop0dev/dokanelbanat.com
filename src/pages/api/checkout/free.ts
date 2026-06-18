import type { APIRoute } from 'astro';

const WOO_BACKEND_URL = import.meta.env.WOO_BACKEND_URL as string | undefined;
const DB_BRIDGE_SECRET = import.meta.env.DB_BRIDGE_SECRET as string | undefined;

const TIMEOUT_MS = 10_000;

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***';
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

/**
 * Validate and normalize an IP address before forwarding to the WordPress bridge.
 *
 * PRODUCTION NOTE: @astrojs/node standalone mode sets clientAddress from the
 * socket remote address. If Astro is behind Nginx/Hostinger without explicit
 * trustProxy configuration, clientAddress may be Nginx's loopback IP rather
 * than the browser's IP — making per-IP rate-limit buckets ineffective (but
 * not harmful). The per-email and global buckets remain effective regardless.
 *
 * Required production validation:
 *   curl -H "X-Forwarded-For: 1.2.3.4" https://<hostname>/api/checkout/free \
 *     -d '{}' -v 2>&1 | grep X-DCB-Client-IP
 * Record what IP WordPress actually receives and compare against the socket IP
 * and the forged XFF value. Do not assume trustProxy behavior until this test
 * passes in the Hostinger environment.
 */
function normalizeClientIp(raw: string): string {
  const addr = (raw ?? '').trim();
  // IPv4
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(addr)) {
    if (addr.split('.').every(o => Number(o) <= 255)) return addr;
  }
  // IPv6 (handles ::1, full, compressed forms)
  if (addr.includes(':') && /^[0-9a-fA-F:]{2,45}$/.test(addr)) {
    return addr.toLowerCase();
  }
  return 'unknown';
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!WOO_BACKEND_URL || !DB_BRIDGE_SECRET) {
    return new Response(
      JSON.stringify({ success: false, message: 'Service misconfigured.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Use the adapter-provided address (socket or proxy-resolved depending on trustProxy config).
  // Validated and normalized before forwarding; 'unknown' when the value is not a valid IP.
  const clientIp = normalizeClientIp(clientAddress);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid request body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (body.privacy_accepted !== true) {
    return new Response(
      JSON.stringify({ success: false, message: 'يجب الموافقة على سياسة الخصوصية.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let bridgeRes: Response;
  try {
    bridgeRes = await fetch(`${WOO_BACKEND_URL}/free-order`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-DCB-Secret': DB_BRIDGE_SECRET,
        'X-DCB-Client-IP': clientIp,
      },
      body: JSON.stringify(body),
    });
  } catch (err: unknown) {
    clearTimeout(timer);
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    return new Response(
      JSON.stringify({
        success: false,
        message: isTimeout
          ? 'الطلب استغرق وقتًا طويلًا، يرجى المحاولة مرة أخرى.'
          : 'تعذّر الاتصال بالخادم. يرجى المحاولة مرة أخرى.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
  clearTimeout(timer);

  let data: Record<string, unknown>;
  try {
    data = await bridgeRes.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'حدث خطأ في الخادم، يرجى المحاولة مرة أخرى.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!bridgeRes.ok) {
    const msg = typeof data?.message === 'string' ? data.message : 'حدث خطأ، يرجى المحاولة مرة أخرى.';
    return new Response(
      JSON.stringify({ success: false, message: msg }),
      { status: bridgeRes.status >= 500 ? 502 : bridgeRes.status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const orderNumber = typeof data.order_number === 'string' ? data.order_number : '';
  const rawEmail = typeof body.email === 'string' ? body.email : '';
  const maskedEmail = maskEmail(rawEmail);

  return new Response(
    JSON.stringify({ success: true, order_number: orderNumber, masked_email: maskedEmail }),
    { status: 201, headers: { 'Content-Type': 'application/json' } }
  );
};
