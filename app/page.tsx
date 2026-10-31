import { cookies } from "next/headers";
import { Registry } from "@/components/registry";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { displayCurrency } from "@/lib/format";
import { getPublicCatalog, getSettings } from "@/lib/store";

export const instant = false;

export default async function HomePage() {
  const [settings, catalog, jar] = await Promise.all([getSettings(), getPublicCatalog(), cookies()]);
  const currency = displayCurrency(jar.get("giftlist_moneda")?.value);

  return (
    <main>
      <SiteHeader settings={settings} currency={currency} />
      <Registry
        catalog={catalog}
        currency={currency}
        copPerUsd={settings.copPerUsd}
        hnlPerUsd={settings.hnlPerUsd}
      />
      <SiteFooter settings={settings} />
    </main>
  );
}
