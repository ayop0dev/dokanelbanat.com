const WP_API = import.meta.env.WP_API_URL ?? "";

function getProxyImageHost() {
  const candidates = [
    import.meta.env.WOO_API_URL,
    import.meta.env.WOO_STORE_API_URL,
    import.meta.env.WOO_BACKEND_URL,
    import.meta.env.WP_API_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      return new URL(candidate).hostname;
    } catch {
      // Ignore malformed optional configuration and try the next candidate.
    }
  }

  return "";
}

const PROXY_IMAGE_HOST = getProxyImageHost();

export function proxyWpImageUrl(src) {
  if (!src) return "";
  try {
    const u = new URL(src);
    return `/api/image?url=${encodeURIComponent(u.pathname + u.search)}`;
  } catch {
    return "";
  }
}

export function rewriteContentImages(html) {
  if (!html) return "";
  return html.replace(
    /(<img\b[^>]*?\ssrc=["'])([^"']+)(["'][^>]*>)/gi,
    (_, before, src, after) => {
      if (src.startsWith('/') || src.startsWith('data:')) return _;
      try {
        if (!PROXY_IMAGE_HOST || new URL(src).hostname !== PROXY_IMAGE_HOST) return _;
      } catch {
        return _;
      }
      const proxied = proxyWpImageUrl(src);
      return proxied ? before + proxied + after : _;
    }
  );
}

async function wpFetch(endpoint) {
  if (!WP_API) return null;
  try {
    const res = await fetch(`${WP_API}${endpoint}`);
    if (!res.ok) throw new Error(`WP REST API ${res.status}: ${endpoint}`);
    return await res.json();
  } catch (err) {
    console.error("[wordpress.js]", err.message);
    return null;
  }
}

/** Latest posts — used in MagazineGrid */
export async function getPosts(perPage = 6) {
  const data = await wpFetch(`/posts?per_page=${perPage}&_embed`);
  return data ?? [];
}

/** Single post by slug — used in blog/[slug].astro */
export async function getPostBySlug(slug) {
  const data = await wpFetch(`/posts?slug=${slug}&_embed`);
  return data?.[0] ?? null;
}

/** All post slugs — used for getStaticPaths */
export async function getAllPostSlugs() {
  const data = await wpFetch(`/posts?per_page=100&fields=slug`);
  return (data ?? []).map((p) => ({ params: { slug: p.slug } }));
}

/** All posts for archive page */
export async function getAllPosts(perPage = 100) {
  const data = await wpFetch(`/posts?per_page=${perPage}&_embed&orderby=date&order=desc`);
  return data ?? [];
}

/** Digital products (custom post type) */
export async function getProducts(perPage = 3) {
  const data = await wpFetch(`/products?per_page=${perPage}&_embed`);
  return data ?? [];
}
