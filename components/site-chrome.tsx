import { CurrencyPicker } from "@/components/currency-picker";
import type { Settings } from "@/lib/types";

export function SiteHeader({ settings }: { settings: Settings }) {
  return (
    <header className="relative mx-auto max-w-5xl px-5 pt-10 text-center sm:pt-14">
      <CurrencyPicker />
      <p className="pointer-events-none absolute top-16 right-6 hidden max-w-40 rotate-[-8deg] text-left font-script text-[1.65rem] leading-tight whitespace-pre-line text-[#6f675f] sm:block">
        {settings.scriptNote}
      </p>
      <img
        src="/ismailadrian.png"
        alt="Ismail Adrián"
        width={256}
        height={256}
        className="mx-auto mt-4 w-64 sm:w-80"
      />
      <p className="mt-2 text-[11px] tracking-[0.42em] text-[#6f675f] uppercase">
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
