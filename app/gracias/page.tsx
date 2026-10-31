import Link from "next/link";
import { cookies } from "next/headers";
import { displayCurrency, formatQuote, formatWhen } from "@/lib/format";
import { getOrderByCode, getSettings } from "@/lib/store";

export const instant = false;

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string }>;
}) {
  const { codigo } = await searchParams;
  const code = codigo?.trim().toUpperCase() ?? "";
  const [order, settings, jar] = await Promise.all([
    code ? getOrderByCode(code) : Promise.resolve(null),
    getSettings(),
    cookies(),
  ]);
  const currency = displayCurrency(jar.get("giftlist_moneda")?.value);

  return (
    <main className="mx-auto flex min-h-full max-w-xl flex-col justify-center px-5 py-16 text-center">
      <p className="text-2xl text-[#c4b8a8]" aria-hidden="true">
        ♡
      </p>
      <h1 className="mt-3 font-serif text-5xl">Gracias</h1>
      {order ? (
        <>
          <p className="mt-4 text-sm leading-relaxed text-[#6f675f]">
            {order.guestName}, {settings.thanksMessage || "apartamos tu selección."}
          </p>
          <ul className="mt-6 space-y-1 text-sm">
            {order.items.map((item) => (
              <li key={item.id}>
                {item.quantity} × {item.name}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-serif text-3xl">
            {formatQuote(order.totalCents, currency, settings.copPerUsd, settings.hnlPerUsd)}
          </p>
          <section className="mt-8 rounded-2xl border border-[#e4dcd0] bg-[#f8f4ee] px-5 py-4 text-left text-sm leading-relaxed">
            <h2 className="text-[11px] tracking-[0.22em] uppercase">Datos para la transferencia</h2>
            <p className="mt-3">STEPHANIE ARIAS GOMEZ</p>
            <p>Número de cuenta BAC Honduras: 746395201</p>
            <p>Número de cuenta Bancolombia: 55171691884</p>
            <p className="mt-3 text-xs text-[#8a8178]">{formatWhen(order.createdAt)}</p>
          </section>
        </>
      ) : (
        <p className="mt-4 text-sm text-[#6f675f]">No encontramos esa selección.</p>
      )}
      <Link href="/" className="mt-8 text-sm underline-offset-4 hover:underline">
        Volver a la lista
      </Link>
    </main>
  );
}
