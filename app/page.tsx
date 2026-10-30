import { Registry } from "@/components/registry";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getPublicCatalog, getSettings } from "@/lib/store";

export const instant = false;

export default async function HomePage() {
  const [settings, catalog] = await Promise.all([getSettings(), getPublicCatalog()]);

  return (
    <main>
      <SiteHeader settings={settings} />
      <Registry catalog={catalog} currency={settings.currency} />
      <SiteFooter settings={settings} />
    </main>
  );
}
