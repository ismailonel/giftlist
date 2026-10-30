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
