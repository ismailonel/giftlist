"use client";

import { useEffect } from "react";
import { ProductVisual } from "./product-visual";

export function ImageLightbox({
  src,
  name,
  onClose,
}: {
  src: string;
  name: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c2926]/70 p-6"
      role="dialog"
      aria-modal="true"
      aria-label={name || "Imagen"}
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Cerrar imagen"
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-[#f7f3ec] transition-colors hover:bg-white/25"
        onClick={onClose}
      >
        ×
      </button>
      <div className="flex h-full max-h-[85vh] w-full max-w-xl flex-col items-center justify-center">
        <div className="aspect-square w-full max-w-md">
          <ProductVisual src={src} name={name} />
        </div>
        <p className="mt-3 text-sm text-[#f7f3ec]">{name}</p>
      </div>
    </div>
  );
}
