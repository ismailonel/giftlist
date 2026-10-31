"use client";

import { useState, useSyncExternalStore } from "react";
import { formatQuote } from "@/lib/format";
import type { CatalogCategory, PublicProduct } from "@/lib/types";
import { useCurrency } from "./currency-picker";
import { GiftBag, type BagLine } from "./gift-bag";
import { ImageLightbox } from "./image-lightbox";
import { ProductVisual } from "./product-visual";

const storageKey = "giftlist-bolsa";
const emptyBag: BagLine[] = [];
let bagSnapshot: BagLine[] = emptyBag;
let bagLoaded = false;

function readBag() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return emptyBag;
    const parsed = JSON.parse(raw) as BagLine[];
    if (!Array.isArray(parsed)) return emptyBag;
    return parsed.filter((line) => line && line.quantity > 0);
  } catch {
    return emptyBag;
  }
}

function getBag() {
  if (!bagLoaded && typeof window !== "undefined") {
    bagLoaded = true;
    bagSnapshot = readBag();
  }
  return bagSnapshot;
}

function setBag(next: BagLine[]) {
  bagSnapshot = next;
  localStorage.setItem(storageKey, JSON.stringify(next));
  window.dispatchEvent(new Event("giftlist-bolsa"));
}

function subscribeBag(onStoreChange: () => void) {
  window.addEventListener("giftlist-bolsa", onStoreChange);
  return () => window.removeEventListener("giftlist-bolsa", onStoreChange);
}

export function Registry({ catalog }: { catalog: CatalogCategory[] }) {
  const { currency, copPerUsd, hnlPerUsd } = useCurrency();
  const lines = useSyncExternalStore(subscribeBag, getBag, () => emptyBag);
  const [open, setOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; name: string } | null>(null);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);

  function add(product: PublicProduct) {
    const current = getBag();
    const existing = current.find((line) => line.id === product.id);
    if (!existing) {
      setBag([
        ...current,
        {
          id: product.id,
          name: product.name,
          priceCents: product.priceCents,
          stock: product.stock,
          imageUrl: product.imageUrl,
          quantity: 1,
        },
      ]);
      return;
    }
    if (existing.quantity >= product.stock) return;
    setBag(
      current.map((line) =>
        line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line,
      ),
    );
  }

  function setQuantity(id: string, quantity: number) {
    setBag(
      getBag().flatMap((line) => {
        if (line.id !== id) return [line];
        if (quantity <= 0) return [];
        return [{ ...line, quantity: Math.min(quantity, line.stock) }];
      }),
    );
  }

  return (
    <>
      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 px-4 md:grid-cols-6">
        {catalog.map((category) => (
          <section
            key={category.id}
            className={`rounded-2xl border border-[#e4dcd0] bg-[#f8f4ee]/80 p-4 sm:p-5 ${spanClass(category.span)}`}
          >
            <h2 className="mb-5 text-[11px] tracking-[0.28em] text-[#6f675f] uppercase">
              {category.name}
            </h2>
            <div
              className={
                category.span === "full"
                  ? "grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 lg:grid-cols-6"
                  : "grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3"
              }
            >
              {category.products.map((product) => {
                const line = lines.find((item) => item.id === product.id);
                return (
                  <article key={product.id} className="flex flex-col items-center text-center">
                    <button
                      type="button"
                      aria-label={`Ver ${product.name} grande`}
                      className="aspect-square w-full max-w-36 cursor-zoom-in"
                      onClick={() => setLightbox({ src: product.imageUrl, name: product.name })}
                    >
                      <ProductVisual src={product.imageUrl} name={product.name} />
                    </button>
                    <h3 className="mt-2 line-clamp-2 min-h-[2.5em] text-[13px] leading-tight">{product.name}</h3>
                    <p className="mt-1 text-xs text-[#8a8178]">
                      {formatQuote(product.priceCents, currency, copPerUsd, hnlPerUsd)}
                    </p>
                    {line ? (
                      <div className="mt-auto flex items-center gap-3 pt-2 text-sm">
                        <button type="button" aria-label={`Quitar un ${product.name}`} onClick={() => setQuantity(product.id, line.quantity - 1)}>
                          −
                        </button>
                        <span className="text-xs tracking-wide text-[#6f675f]">En tu bolsa · {line.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Agregar otro ${product.name}`}
                          disabled={line.quantity >= product.stock}
                          onClick={() => add(product)}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <div className="mt-auto w-full pt-2">
                        <button
                          type="button"
                          className="mx-auto block w-full rounded-full bg-[#3f3a34] px-4 py-2 text-[11px] leading-snug tracking-wide text-[#f7f3ec] transition-opacity hover:opacity-85"
                          onClick={() => add(product)}
                        >
                          Agregar
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      {catalog.length === 0 ? (
        <p className="px-6 py-16 text-center text-sm text-[#6f675f]">
          Todavía no hay regalos publicados.
        </p>
      ) : null}
      {count > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e4dcd0] bg-[#f7f3ec]/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase">Tu bolsa</p>
              <p className="text-sm text-[#6f675f]">
                {count} {count === 1 ? "regalo" : "regalos"} · {formatQuote(total, currency, copPerUsd, hnlPerUsd)}
              </p>
            </div>
            <button
              type="button"
              className="rounded-full bg-[#3f3a34] px-4 py-2 text-sm text-[#f7f3ec]"
              onClick={() => setOpen(true)}
            >
              Ver bolsa
            </button>
          </div>
        </div>
      ) : null}
      <GiftBag
        open={open}
        lines={lines}
        onClose={() => setOpen(false)}
        onQuantity={setQuantity}
        onClear={() => {
          setBag([]);
          setOpen(false);
        }}
        onUnavailable={(ids) => setBag(getBag().filter((line) => !ids.includes(line.id)))}
      />
      {lightbox ? <ImageLightbox src={lightbox.src} name={lightbox.name} onClose={() => setLightbox(null)} /> : null}
    </>
  );
}

function spanClass(span: CatalogCategory["span"]) {
  if (span === "half") return "md:col-span-3";
  if (span === "third") return "md:col-span-2";
  return "md:col-span-6";
}
