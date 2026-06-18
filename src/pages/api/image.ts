import type { APIRoute } from 'astro';

const WOO_BACKEND_URL = import.meta.env.WOO_BACKEND_URL as string | undefined;
const ALLOWED_IMAGE_HOSTS = (import.meta.env.WOO_API_URL || import.meta.env.WOO_STORE_API_URL || '');

const TIMEOUT_MS = 10_000;
// SVG excluded: it can contain embedded <script> tags and would execute on the first-party origin.
const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
]);

function extractAllowedHost(): string {
  const candidates = [
    import.meta.env.WOO_API_URL,
    import.meta.env.WOO_STORE_API_URL,
    import.meta.env.WOO_BACKEND_URL,
  ];
  for (const c of candidates) {
    if (!c) continue;
    try {
      return new URL(c as string).hostname;
    } catch { /* skip */ }
  }
  return '';
}

const ALLOWED_HOST = extractAllowedHost();

export const GET: APIRoute = async ({ url }) => {
  const rawPath = url.searchParams.get('url') ?? '';

  if (!rawPath || !ALLOWED_HOST) {
    return notFound();
  }

  let safePath: string;
  try {
    const parsed = new URL(rawPath, 'http://placeholder');
    safePath = parsed.pathname + (parsed.search || '');
  } catch {
    return notFound();
  }

  if (safePath.includes('..')) {
    return notFound();
  }

  const targetUrl = `https://${ALLOWED_HOST}${safePath}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      redirect: 'manual',
      signal: controller.signal,
      headers: { 'User-Agent': 'DokanelbanatProxy/1.0' },
    });
  } catch {
    clearTimeout(timer);
    return notFound();
  }
  clearTimeout(timer);

  // Reject redirects — a redirect could point outside ALLOWED_HOST (SSRF).
  if (upstream.status >= 300 || !upstream.ok || !upstream.body) {
    return notFound();
  }

  const contentType = upstream.headers.get('Content-Type') ?? '';
  const mimeBase = contentType.split(';')[0].trim();

  if (!ALLOWED_MIME.has(mimeBase)) {
    return notFound();
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};

function notFound(): Response {
  return new Response(null, { status: 404 });
}
