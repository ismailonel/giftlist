"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmGifts } from "@/app/actions";
import { formatQuote, type DisplayCurrency } from "@/lib/format";
import { ProductVisual } from "./product-visual";

export type BagLine = {
  id: string;
  name: string;
  priceCents: number;
  stock: number;
  imageUrl: string;
  quantity: number;
};

export function GiftBag({
  open,
  lines,
  currency,
  copPerUsd,
  hnlPerUsd,
  onClose,
  onQuantity,
  onClear,
  onUnavailable,
}: {
  open: boolean;
  lines: BagLine[];
  currency: DisplayCurrency;
  copPerUsd: number;
  hnlPerUsd: number;
  onClose: () => void;
  onQuantity: (id: string, quantity: number) => void;
  onClear: () => void;
  onUnavailable: (ids: string[]) => void;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const total = lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);

  if (!open) return null;

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    try {
      const result = await confirmGifts({
        name: String(formData.get("name") ?? ""),
        email: "",
        message: String(formData.get("message") ?? ""),
        website: String(formData.get("website") ?? ""),
        items: lines.map((line) => ({ productId: line.id, quantity: line.quantity })),
      });
      if (!result.ok) {
        if (result.unavailable.length > 0) {
          onUnavailable(result.unavailable.map((item) => item.id));
        }
        const names = result.unavailable.map((item) => item.name).join(", ");
        setError(names ? `${result.error} ${names}.` : result.error);
        return;
      }
      onClear();
      router.push(`/gracias?codigo=${result.code}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[#2c2926]/30">
      <button className="hidden flex-1 sm:block" type="button" aria-label="Cerrar" onClick={onClose} />
      <div className="flex h-full w-full flex-col bg-[#f7f3ec] shadow-none sm:max-w-md sm:border-l sm:border-[#e4dcd0]">
        <div className="flex items-center justify-between border-b border-[#e4dcd0] px-5 py-4">
          <h2 className="font-serif text-3xl">Bolsa de regalo</h2>
          <button type="button" className="text-sm tracking-wide text-[#6f675f]" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
          {lines.length === 0 ? (
            <p className="text-sm text-[#6f675f]">Tu bolsa está vacía.</p>
          ) : (
            <ul className="space-y-2">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-3">
                  <div className="h-12 w-12 shrink-0">
                    <ProductVisual src={line.imageUrl} name="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{line.name}</p>
                    <p className="text-xs text-[#8a8178]">
                      {formatQuote(line.priceCents, currency, copPerUsd, hnlPerUsd)}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-sm">
                      <button type="button" aria-label="Quitar uno" onClick={() => onQuantity(line.id, line.quantity - 1)}>
                        −
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="Agregar uno"
                        disabled={line.quantity >= line.stock}
                        onClick={() => onQuantity(line.id, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {lines.length > 0 ? (
          <form action={onSubmit} className="space-y-2.5 border-t border-[#e4dcd0] px-5 py-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] tracking-[0.22em] uppercase">Total</span>
              <span className="font-serif text-2xl">{formatQuote(total, currency, copPerUsd, hnlPerUsd)}</span>
            </div>
            <div className="rounded-2xl border border-[#e4dcd0] bg-[#f8f4ee] px-4 py-2 text-sm leading-snug">
              <p className="text-[11px] tracking-[0.22em] uppercase text-[#6f675f]">Datos para la transferencia</p>
              <p className="mt-2">STEPHANIE ARIAS GOMEZ</p>
              <p>Número de cuenta BAC Honduras: 746395201</p>
              <p>Número de cuenta Bancolombia: 55171691884</p>
            </div>
            <label className="block text-sm">
              Nombre
              <input
                name="name"
                required
                autoComplete="name"
                className="mt-1 w-full rounded-xl border border-[#e4dcd0] bg-white/70 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Un mensaje para nosotros
              <textarea
                name="message"
                rows={2}
                className="mt-1 w-full rounded-xl border border-[#e4dcd0] bg-white/70 px-3 py-2"
              />
            </label>
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            {error ? <p className="text-sm text-[#8a4b3a]">{error}</p> : null}
            <p className="text-xs leading-relaxed text-[#6f675f]">
              No hay pago en el sitio. Envía la transferencia a la cuenta indicada y guarda tu código de referencia.
            </p>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-[#3f3a34] px-4 py-2.5 text-sm tracking-wide text-[#f7f3ec] disabled:opacity-60"
            >
              {pending ? "Enviando…" : "Confirmar regalos"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
