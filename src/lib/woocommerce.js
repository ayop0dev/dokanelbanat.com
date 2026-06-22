import { Buffer } from 'node:buffer';
import { toPlainText } from './sanitize-content.js';

const WOO_STORE_API = import.meta.env.WOO_STORE_API_URL ?? "";
const WOO_API = import.meta.env.WOO_API_URL ?? "";
const WOO_CONSUMER_KEY = import.meta.env.WOO_CONSUMER_KEY;
const WOO_CONSUMER_SECRET = import.meta.env.WOO_CONSUMER_SECRET;

function proxyImageUrl(src) {
  if (!src) return "";
  try {
    const u = new URL(src);
    return `/api/image?url=${encodeURIComponent(u.pathname + u.search)}`;
  } catch {
    return "";
  }
}

async function wooFetch(url, source, fetchOptions = {}) {
  if (!url) return null;
  try {
    const res = await fetch(url, fetchOptions);
    if (!res.ok) throw new Error(`${source} ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[woocommerce.js]", err.message);
    return null;
  }
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
    name: toPlainText(product.name),
    slug: product.slug,
    type: product.type,
    permalink: product.permalink,
    productUrl: getInternalProductUrl(product.slug),
    checkoutUrl: getCheckoutUrl(product.id),
    shortDescription: toPlainText(product.short_description || product.description || ""),
    description: product.description || "",
    price: formatStorePrice(product.prices),
    isInStock: product.is_in_stock,
    image: image
      ? {
          src: proxyImageUrl(image.src),
          alt: image.alt || toPlainText(product.name),
        }
      : null,
    images: (product.images ?? []).map((item) => ({
      src: proxyImageUrl(item.src),
      alt: item.alt || toPlainText(product.name),
    })),
    category: category?.name ?? "",
  };
}

function normalizeAdminProduct(product) {
  const image = product.images?.[0];
  const category = product.categories?.[0];

  return {
    id: product.id,
    name: toPlainText(product.name),
    slug: product.slug,
    type: product.type,
    permalink: product.permalink,
    productUrl: getInternalProductUrl(product.slug),
    checkoutUrl: getCheckoutUrl(product.id),
    shortDescription: toPlainText(product.short_description || product.description || ""),
    description: product.description || "",
    price: formatAdminPrice(product),
    isInStock: product.stock_status === "instock",
    image: image
      ? {
          src: proxyImageUrl(image.src),
          alt: image.alt || toPlainText(product.name),
        }
      : null,
    images: (product.images ?? []).map((item) => ({
      src: proxyImageUrl(item.src),
      alt: item.alt || toPlainText(product.name),
    })),
    category: category?.name ?? "",
  };
}

function getCheckoutUrl(productId) {
  return `/checkout?product=${encodeURIComponent(productId)}`;
}

function getInternalProductUrl(slug) {
  return `/products/${slug}`;
}

async function getAdminProducts(perPage) {
  if (!WOO_CONSUMER_KEY || !WOO_CONSUMER_SECRET || !WOO_API) return null;

  const encodedCredentials = Buffer.from(
    `${WOO_CONSUMER_KEY}:${WOO_CONSUMER_SECRET}`,
    'utf8'
  ).toString('base64');

  const params = new URLSearchParams({
    per_page: String(perPage),
    status: "publish",
    orderby: "date",
    order: "desc",
  });

  const data = await wooFetch(
    `${WOO_API}/products?${params}`,
    "WooCommerce REST API",
    { headers: { Authorization: `Basic ${encodedCredentials}` } }
  );
  return Array.isArray(data) ? data.map(normalizeAdminProduct) : null;
}

async function getStoreProducts(perPage) {
  if (!WOO_STORE_API) return [];

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

export async function getAllProductSlugs(perPage = 100) {
  const products = await getProducts(perPage);
  return products.map((product) => ({ params: { slug: product.slug } }));
}

export async function getProductBySlug(slug) {
  const products = await getProducts(100);
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProductById(id) {
  const products = await getProducts(100);
  return products.find((product) => product.id === id) ?? null;
}
