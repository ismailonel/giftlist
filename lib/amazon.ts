import "server-only";

import { storeImage } from "./images";

const AMAZON_PAGE =
  /(^|\.)amazon\.(com|com\.mx|com\.br|es|ca|co\.uk|de|fr|it|nl|in|com\.au|co|cl)$/i;

export type AmazonImport =
  | {
      ok: true;
      name: string;
      imageUrl: string | null;
      priceCents: number | null;
      warning: string;
    }
  | { ok: false; error: string };

export async function importAmazonProduct(rawUrl: string): Promise<AmazonImport> {
  let page: URL;
  try {
    page = new URL(rawUrl.trim());
  } catch {
    return { ok: false, error: "Ese enlace no es válido." };
  }

  if (page.protocol !== "https:" || !AMAZON_PAGE.test(page.hostname)) {
    return { ok: false, error: "Usa un enlace https de Amazon." };
  }

  let html = "";
  try {
    html = await fetchAmazonHtml(page);
  } catch {
    return {
      ok: false,
      error: "No pudimos abrir la página. Carga la imagen a mano.",
    };
  }

  if (looksBlocked(html)) {
    return {
      ok: false,
      error: "Amazon no dejó leer esta página. Carga la imagen a mano.",
    };
  }

  const name = cleanTitle(meta(html, "og:title") || titleTag(html));
  const image = meta(html, "og:image") || meta(html, "twitter:image");
  const priceCents = priceFromJsonLd(html);

  if (!name && !image) {
    return {
      ok: false,
      error: "No encontramos el nombre ni la imagen. Complétalos a mano.",
    };
  }

  let imageUrl: string | null = null;
  let warning = priceCents == null ? "" : "Revisa el precio: puede estar en otra moneda.";

  if (image) {
    try {
      imageUrl = await saveRemoteImage(image);
    } catch {
      warning = warning
        ? `${warning} Tampoco pudimos guardar la imagen.`
        : "No pudimos guardar la imagen. Súbela a mano.";
    }
  }

  return { ok: true, name, imageUrl, priceCents, warning };
}

async function fetchAmazonHtml(start: URL) {
  let current = start;
  for (let hop = 0; hop < 4; hop += 1) {
    assertPublicAmazon(current);
    const response = await fetch(current, {
      redirect: "manual",
      headers: {
        accept: "text/html,application/xhtml+xml",
        "accept-language": "es-419,es;q=0.9,en;q=0.8",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("redirect");
      current = new URL(location, current);
      continue;
    }

    if (!response.ok) throw new Error("status");
    const html = await response.text();
    if (html.length > 2_000_000) throw new Error("large");
    return html;
  }
  throw new Error("redirects");
}

function assertPublicAmazon(url: URL) {
  if (url.protocol !== "https:") throw new Error("protocol");
  if (isIp(url.hostname) || url.hostname === "localhost") throw new Error("host");
  if (!AMAZON_PAGE.test(url.hostname)) throw new Error("host");
}

async function saveRemoteImage(raw: string) {
  const imageUrl = new URL(decodeHtml(raw));
  if (imageUrl.protocol !== "https:" || isIp(imageUrl.hostname)) {
    throw new Error("image-host");
  }
  if (!/amazon|media-amazon|ssl-images-amazon/i.test(imageUrl.hostname)) {
    throw new Error("image-host");
  }

  const response = await fetch(imageUrl, {
    redirect: "manual",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("image-status");
  const contentType = (response.headers.get("content-type") || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength < 800) throw new Error("tiny");
  return storeImage(bytes, contentType);
}

function meta(html: string, key: string) {
  const propertyFirst = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const contentFirst = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
    "i",
  );
  return decodeHtml(html.match(propertyFirst)?.[1] || html.match(contentFirst)?.[1] || "");
}

function titleTag(html: string) {
  return decodeHtml(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || "");
}

function cleanTitle(value: string) {
  return value
    .replace(/^amazon\.[a-z.]+\s*[:|-]\s*/i, "")
    .replace(/\s*[:|-]\s*amazon\.[a-z.]+\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

function priceFromJsonLd(html: string) {
  const blocks = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  for (const block of blocks) {
    try {
      const price = findPrice(JSON.parse(block[1]));
      if (price != null) return price;
    } catch {
      continue;
    }
  }
  return null;
}

function findPrice(value: unknown): number | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findPrice(entry);
      if (found != null) return found;
    }
    return null;
  }
  const record = value as Record<string, unknown>;
  const offers = record.offers;
  const direct = readPrice(offers) ?? readPrice(record);
  if (direct != null) return direct;
  for (const nested of Object.values(record)) {
    const found = findPrice(nested);
    if (found != null) return found;
  }
  return null;
}

function readPrice(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const raw = record.price ?? record.lowPrice;
  if (typeof raw === "number" && Number.isFinite(raw)) return Math.round(raw * 100);
  if (typeof raw === "string" && /^\d+(\.\d{1,2})?$/.test(raw)) {
    return Math.round(Number(raw) * 100);
  }
  return null;
}

function looksBlocked(html: string) {
  return /captcha|opfcaptcha|robot check|api-services-support@amazon/i.test(html) && !meta(html, "og:image");
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function isIp(hostname: string) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.includes(":");
}
