export type DisplayCurrency = "COP" | "HNL";

export function displayCurrency(value: string | undefined): DisplayCurrency {
  return value === "HNL" ? "HNL" : "COP";
}

export function formatQuote(
  cents: number,
  currency: DisplayCurrency,
  copPerUsd: number,
  hnlPerUsd: number,
) {
  const rate = currency === "HNL" ? hnlPerUsd : copPerUsd;
  const amount = (cents / 100) * rate;
  return new Intl.NumberFormat(currency === "HNL" ? "es-HN" : "es-CO", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "COP" ? 0 : 2,
    maximumFractionDigits: currency === "COP" ? 0 : 2,
  }).format(amount);
}

export function parseTurkishRate(value: string) {
  const trimmed = value.trim().replace(/\s/g, "");
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,4})?$|^\d+(,\d{1,4})?$/.test(trimmed)) return null;
  const amount = Number(trimmed.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

export function rateOr(value: unknown, fallback: number) {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : fallback;
}

export function formatTurkishRate(value: number) {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 4 }).format(value);
}

export function formatMoney(cents: number, currency: string) {
  const code = /^[A-Z]{3}$/.test(currency) ? currency : "USD";
  try {
    return new Intl.NumberFormat("es-419", {
      style: "currency",
      currency: code,
    }).format(cents / 100);
  } catch {
    return new Intl.NumberFormat("es-419", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  }
}

export function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("es-419", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function dollarsToCents(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export function centsToInput(cents: number) {
  return (cents / 100).toFixed(2);
}
