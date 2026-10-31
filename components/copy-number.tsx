"use client";

import { useState } from "react";

export function CopyNumber({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = value;
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <span className="flex items-center gap-1.5">
      <span className="font-mono tracking-wide">{value}</span>
      <button
        type="button"
        aria-label={`Copiar número de ${label}`}
        onClick={copy}
        className="rounded-full border border-[#e4dcd0] px-2.5 py-0.5 text-[11px] text-[#6f675f] transition-colors hover:border-[#3f3a34] hover:text-[#3f3a34]"
      >
        {copied ? "¡Copiado!" : "Copiar"}
      </button>
    </span>
  );
}
