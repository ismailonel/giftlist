"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  deleteProductAction,
  importFromAmazon,
  saveProductAction,
  uploadProductImage,
} from "@/app/actions";
import { centsToInput } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import { ProductVisual } from "./product-visual";

export function ProductForm({
  product,
  categories,
  defaultCategoryId,
  defaultSort,
}: {
  product: Product | null;
  categories: Category[];
  defaultCategoryId?: string;
  defaultSort?: number;
}) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product ? centsToInput(product.priceCents) : "");
  const [stock, setStock] = useState(String(product?.stock ?? 1));
  const [categoryId, setCategoryId] = useState(
    product?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? "",
  );
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [amazonUrl, setAmazonUrl] = useState(product?.amazonUrl ?? "");
  const [sort, setSort] = useState(String(product?.sort ?? defaultSort ?? 10));
  const [published, setPublished] = useState(product?.published ?? false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function pullAmazon() {
    setPending(true);
    setMessage("Buscando en Amazon…");
    try {
      const result = await importFromAmazon(amazonUrl);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      if (result.name) setName(result.name);
      if (result.imageUrl) setImageUrl(result.imageUrl);
      if (result.priceCents != null) setPrice(centsToInput(result.priceCents));
      setMessage(result.warning || "Datos listos. Revísalos antes de guardar.");
    } finally {
      setPending(false);
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setPending(true);
    setMessage("Guardando imagen…");
    try {
      const data = new FormData();
      data.set("file", file);
      const result = await uploadProductImage(data);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setImageUrl(result.url);
      setMessage("Imagen lista.");
    } finally {
      setPending(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const result = await saveProductAction({
        id: product?.id ?? "",
        categoryId,
        name,
        price,
        stock: Number(stock),
        imageUrl,
        amazonUrl,
        sort: Number(sort),
        published,
      });
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      router.push("/admin/productos");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="space-y-4 rounded-2xl border border-[#e4dcd0] bg-[#f8f4ee] p-5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="block flex-1 text-sm">
            Enlace de Amazon
            <input
              value={amazonUrl}
              onChange={(event) => setAmazonUrl(event.target.value)}
              placeholder="https://www.amazon.com/dp/..."
              className={fieldClass}
            />
          </label>
          <button
            type="button"
            disabled={pending || amazonUrl.trim() === ""}
            onClick={pullAmazon}
            className="self-end rounded-full border border-[#3f3a34] px-4 py-2 text-sm disabled:opacity-50"
          >
            Traer datos
          </button>
        </div>
        <label className="block text-sm">
          Nombre
          <input required value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            Precio
            <input required inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} className={fieldClass} />
          </label>
          <label className="text-sm">
            Disponibles
            <input required type="number" min={0} value={stock} onChange={(event) => setStock(event.target.value)} className={fieldClass} />
          </label>
          <label className="text-sm">
            Orden
            <input required type="number" value={sort} onChange={(event) => setSort(event.target.value)} className={fieldClass} />
          </label>
        </div>
        <label className="block text-sm">
          Categoría
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className={fieldClass}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Imagen
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="mt-1 block w-full text-sm"
            onChange={(event) => onFile(event.target.files?.[0])}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} />
          Visible en la lista
        </label>
        {message ? <p className="text-sm text-[#6f675f]">{message}</p> : null}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={pending} className="rounded-full bg-[#3f3a34] px-5 py-2 text-sm text-[#f7f3ec] disabled:opacity-60">
            Guardar
          </button>
          {product ? (
            <button
              type="button"
              className="text-sm text-[#8a4b3a]"
              onClick={async () => {
                if (!window.confirm("¿Quitar este regalo de la lista?")) return;
                await deleteProductAction(product.id);
                router.push("/admin/productos");
                router.refresh();
              }}
            >
              Eliminar
            </button>
          ) : null}
        </div>
      </div>
      <div className="rounded-2xl border border-[#e4dcd0] bg-[#f8f4ee] p-5">
        <div className="mx-auto aspect-square max-w-48">
          {imageUrl ? <ProductVisual src={imageUrl} name={name || "Regalo"} /> : <div className="h-full bg-[#efe8dc]" />}
        </div>
        <p className="mt-3 text-center text-sm">{name || "Sin nombre"}</p>
      </div>
    </form>
  );
}

const fieldClass = "mt-1 w-full rounded-xl border border-[#e4dcd0] bg-white/70 px-3 py-2";
