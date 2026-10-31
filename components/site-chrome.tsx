import { setDisplayCurrency } from "@/app/actions";
import type { DisplayCurrency } from "@/lib/format";
import type { Settings } from "@/lib/types";

export function SiteHeader({
  settings,
  currency,
}: {
  settings: Settings;
  currency: DisplayCurrency;
}) {
  const [first, second] = monogramLetters(settings.monogram);

  return (
    <header className="relative mx-auto max-w-5xl px-5 pt-10 text-center sm:pt-14">
      <form action={setDisplayCurrency} className="absolute top-3 right-5 z-10 inline-flex rounded-full border border-[#e4dcd0] bg-[#f7f3ec]/90 p-0.5 text-[11px] tracking-[0.14em]">
        {(["COP", "HNL"] as const).map((code) => (
          <button
            key={code}
            name="moneda"
            value={code}
            aria-pressed={currency === code}
            className={
              currency === code
                ? "rounded-full bg-[#3f3a34] px-3 py-1 text-[#f7f3ec]"
                : "rounded-full px-3 py-1 text-[#6f675f]"
            }
          >
            {code}
          </button>
        ))}
      </form>
      <p className="pointer-events-none absolute top-16 right-6 hidden max-w-40 rotate-[-8deg] text-left font-script text-[1.65rem] leading-tight whitespace-pre-line text-[#6f675f] sm:block">
        {settings.scriptNote}
      </p>
      <div className="relative mx-auto h-16 w-16 font-serif text-[2.6rem] leading-none text-[#2c2926]">
        <span className="absolute top-0 left-0">{first}</span>
        <span className="absolute right-0 bottom-0">{second}</span>
      </div>
      <p className="mt-5 text-[11px] tracking-[0.42em] text-[#6f675f] uppercase">
        {settings.siteName}
      </p>
      <h1 className="mx-auto mt-3 max-w-3xl font-serif text-[2.6rem] leading-[1.05] font-medium tracking-tight text-[#2c2926] sm:text-6xl">
        {settings.title}
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-[11px] tracking-[0.22em] text-[#8a8178] uppercase">
        {settings.subtitle} <span aria-hidden="true">♡</span>
      </p>
      <p className="mx-auto mt-4 max-w-44 font-script text-2xl leading-tight whitespace-pre-line text-[#6f675f] sm:hidden">
        {settings.scriptNote}
      </p>
    </header>
  );
}

export function SiteFooter({ settings }: { settings: Settings }) {
  return (
    <footer className="px-6 pt-8 pb-28 text-center">
      <p className="text-[10px] tracking-[0.32em] text-[#8a8178] uppercase">
        {settings.footerLine}
      </p>
      <p className="mt-3 text-[11px] tracking-[0.42em] uppercase">{settings.siteName}</p>
      <p className="mt-4 text-lg text-[#c4b8a8]" aria-hidden="true">
        ♡
      </p>
    </footer>
  );
}

function monogramLetters(value: string) {
  const letters = value.replace(/\s+/g, "").toLocaleUpperCase("es");
  const first = letters[0] || "L";
  return [first, letters[1] || first] as const;
}
