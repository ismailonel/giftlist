"use client";

import { deleteProductAction } from "@/app/actions";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteProductAction.bind(null, id)}
      onSubmit={(event) => {
        if (!window.confirm(`¿Eliminar "${name}"?`)) event.preventDefault();
      }}
    >
      <button className="shrink-0 rounded-full border border-[#8a4b3a]/40 px-3 py-1.5 text-xs text-[#8a4b3a]">
        Eliminar
      </button>
    </form>
  );
}
