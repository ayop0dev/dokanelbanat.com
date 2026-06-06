const WP_API = import.meta.env.WP_API_URL;

async function wpFetch(endpoint) {
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
