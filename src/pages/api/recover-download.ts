import type { APIRoute } from 'astro';

const WOO_BACKEND_URL = import.meta.env.WOO_BACKEND_URL as string | undefined;
const DB_BRIDGE_SECRET = import.meta.env.DB_BRIDGE_SECRET as string | undefined;
const TIMEOUT_MS = 10_000;

const PUBLIC_RESPONSE = {
  success: true,
  message: 'إذا كانت المعلومات صحيحة، ستصل رسالة إلكترونية جديدة خلال دقائق.',
};

function normalizeClientIp(raw: string): string {
  const addr = (raw ?? '').trim();
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(addr)) {
    if (addr.split('.').every(o => Number(o) <= 255)) return addr;
  }
  if (addr.includes(':') && /^[0-9a-fA-F:]{2,45}$/.test(addr)) {
    return addr.toLowerCase();
  }
  return 'unknown';
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!WOO_BACKEND_URL || !DB_BRIDGE_SECRET) {
    return jsonResponse(PUBLIC_RESPONSE, 200);
  }

  // Adapter-provided address, validated as IPv4/IPv6 before forwarding.
  // See free.ts normalizeClientIp() for the production validation requirement.
  const clientIp = normalizeClientIp(clientAddress);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(PUBLIC_RESPONSE, 200);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    await fetch(`${WOO_BACKEND_URL}/recover`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-DCB-Secret': DB_BRIDGE_SECRET,
        'X-DCB-Client-IP': clientIp,
      },
      body: JSON.stringify({
        email: body.email ?? '',
        order_number: body.order_number ?? '',
        website: body.website ?? '',
      }),
    });
  } catch {
    /* silent — always return public response */
  } finally {
    clearTimeout(timer);
  }

  return jsonResponse(PUBLIC_RESPONSE, 200);
};

function jsonResponse(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
