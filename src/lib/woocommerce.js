const WOO_STORE_API =
  import.meta.env.WOO_STORE_API_URL ?? "https://blog.dokanelbanat.com/wp-json/wc/store/v1";
const WOO_API = import.meta.env.WOO_API_URL ?? "https://blog.dokanelbanat.com/wp-json/wc/v3";
const WOO_CONSUMER_KEY = import.meta.env.WOO_CONSUMER_KEY;
const WOO_CONSUMER_SECRET = import.meta.env.WOO_CONSUMER_SECRET;

async function wooFetch(url, source) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${source} ${res.status}: ${url}`);
    return await res.json();
  } catch (err) {
    console.error("[woocommerce.js]", err.message);
    return null;
  }
}

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function stripHtml(value = "") {
  return decodeHtml(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function formatStorePrice(prices) {
  if (!prices) return "";

  const minorUnit = Number(prices.currency_minor_unit ?? 2);
  const rawPrice = Number(prices.price ?? 0);
  const price = rawPrice / 10 ** minorUnit;

  if (rawPrice === 0) return "مجاني";

  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: prices.currency_code ?? "EGP",
    maximumFractionDigits: minorUnit,
  }).format(price);
}

function formatAdminPrice(product) {
  const rawPrice = Number(product.price ?? 0);

  if (!rawPrice) return "مجاني";

  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(rawPrice);
}

function normalizeStoreProduct(product) {
  const image = product.images?.[0];
  const category = product.categories?.[0];

  return {
    id: product.id,
    name: decodeHtml(product.name),
    slug: product.slug,
    type: product.type,
    permalink: product.permalink,
    shortDescription: stripHtml(product.short_description || product.description || ""),
    price: formatStorePrice(product.prices),
    isInStock: product.is_in_stock,
    image: image
      ? {
          src: image.src,
          alt: image.alt || product.name,
        }
      : null,
    category: category?.name ?? "",
  };
}

function normalizeAdminProduct(product) {
  const image = product.images?.[0];
  const category = product.categories?.[0];

  return {
    id: product.id,
    name: decodeHtml(product.name),
    slug: product.slug,
    type: product.type,
    permalink: product.permalink,
    shortDescription: stripHtml(product.short_description || product.description || ""),
    price: formatAdminPrice(product),
    isInStock: product.stock_status === "instock",
    image: image
      ? {
          src: image.src,
          alt: image.alt || product.name,
        }
      : null,
    category: category?.name ?? "",
  };
}

async function getAdminProducts(perPage) {
  if (!WOO_CONSUMER_KEY || !WOO_CONSUMER_SECRET) return null;

  const params = new URLSearchParams({
    per_page: String(perPage),
    status: "publish",
    orderby: "date",
    order: "desc",
    consumer_key: WOO_CONSUMER_KEY,
    consumer_secret: WOO_CONSUMER_SECRET,
  });

  const data = await wooFetch(`${WOO_API}/products?${params}`, "WooCommerce REST API");
  return Array.isArray(data) ? data.map(normalizeAdminProduct) : null;
}

async function getStoreProducts(perPage) {
  const params = new URLSearchParams({
    per_page: String(perPage),
    orderby: "date",
    order: "desc",
  });

  const data = await wooFetch(`${WOO_STORE_API}/products?${params}`, "WooCommerce Store API");
  return Array.isArray(data) ? data.map(normalizeStoreProduct) : [];
}

export async function getProducts(perPage = 6) {
  return (await getAdminProducts(perPage)) ?? (await getStoreProducts(perPage));
}
