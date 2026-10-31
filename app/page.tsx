import { cookies } from "next/headers";
import { CurrencyProvider } from "@/components/currency-picker";
import { Registry } from "@/components/registry";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { displayCurrency } from "@/lib/format";
import { getPublicCatalog, getSettings } from "@/lib/store";

export const instant = false;

export default async function HomePage() {
  const [settings, catalog, jar] = await Promise.all([getSettings(), getPublicCatalog(), cookies()]);
  const currency = displayCurrency(jar.get("giftlist_moneda")?.value);

  return (
    <CurrencyProvider initial={currency} copPerUsd={settings.copPerUsd} hnlPerUsd={settings.hnlPerUsd}>
      <main>
        <SiteHeader settings={settings} />
        <Registry catalog={catalog} />
        <SiteFooter settings={settings} />
      </main>
    </CurrencyProvider>
  );
}
