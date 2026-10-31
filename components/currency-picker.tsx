"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { DisplayCurrency } from "@/lib/format";

type CurrencyState = {
  currency: DisplayCurrency;
  copPerUsd: number;
  hnlPerUsd: number;
  choose: (currency: DisplayCurrency) => void;
};

const CurrencyContext = createContext<CurrencyState | null>(null);

export function CurrencyProvider({
  initial,
  copPerUsd,
  hnlPerUsd,
  children,
}: {
  initial: DisplayCurrency;
  copPerUsd: number;
  hnlPerUsd: number;
  children: ReactNode;
}) {
  const [currency, setCurrency] = useState(initial);

  function choose(next: DisplayCurrency) {
    setCurrency(next);
    document.cookie = `giftlist_moneda=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }

  return (
    <CurrencyContext.Provider value={{ currency, copPerUsd, hnlPerUsd, choose }}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error("Falta la moneda");
  return value;
}

export function CurrencyPicker() {
  const { currency, choose } = useCurrency();

  return (
    <div className="absolute top-3 right-5 z-10 inline-flex rounded-full border border-[#e4dcd0] bg-[#f7f3ec]/90 p-0.5 text-[11px] tracking-[0.14em]">
      {(["COP", "HNL"] as const).map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={currency === code}
          onClick={() => choose(code)}
          className={
            currency === code
              ? "rounded-full bg-[#3f3a34] px-3 py-1 text-[#f7f3ec]"
              : "rounded-full px-3 py-1 text-[#6f675f]"
          }
        >
          {code}
        </button>
      ))}
    </div>
  );
}
