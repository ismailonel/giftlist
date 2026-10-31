import Link from "next/link";
import { deleteCategoryAction, saveCategoryAction } from "@/app/actions";
import { ProductVisual } from "@/components/product-visual";
import { requireAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { adminCatalog, getSettings } from "@/lib/store";

export const instant = false;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;
  const [data, settings] = await Promise.all([adminCatalog(), getSettings()]);
  const categories = data.categories.slice().sort((a, b) => a.sort - b.sort);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-4xl">Productos</h1>
        <Link href="/admin/productos/nuevo" className="rounded-full bg-[#3f3a34] px-4 py-2 text-sm text-[#f7f3ec]">
          Nuevo
        </Link>
      </div>
      {error ? (
        <p className="text-sm text-[#8a4b3a]">No se pudo guardar la categoría. Si tiene regalos, quítalos primero.</p>
      ) : null}
      {categories.map((category) => (
        <section key={category.id} className="rounded-2xl border border-[#e4dcd0] p-4">
          <form action={saveCategoryAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="id" value={category.id} />
            <label className="text-sm">
              Categoría
              <input name="name" defaultValue={category.name} className={fieldClass} />
            </label>
            <label className="text-sm">
              Ancho
              <select name="span" defaultValue={category.span} className={fieldClass}>
                <option value="full">Completo</option>
                <option value="half">Mitad</option>
                <option value="third">Tercio</option>
              </select>
            </label>
            <label className="text-sm">
              Orden
              <input name="sort" type="number" defaultValue={category.sort} className={fieldClass} />
            </label>
            <button className="rounded-full border border-[#3f3a34] px-3 py-2 text-sm">Guardar</button>
          </form>
          <form action={deleteCategoryAction} className="mt-2">
            <input type="hidden" name="id" value={category.id} />
            <button className="text-xs text-[#8a4b3a]">Eliminar categoría</button>
          </form>
          <ul className="mt-4 divide-y divide-[#e4dcd0]">
            {data.products
              .filter((product) => product.categoryId === category.id)
              .sort((a, b) => a.sort - b.sort)
              .map((product) => (
                <li key={product.id}>
                  <Link href={`/admin/productos/${product.id}`} className="flex items-center gap-3 py-3">
                    <span className="h-14 w-14 shrink-0">
                      <ProductVisual src={product.imageUrl} name="" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm">{product.name}</span>
                      <span className="text-xs text-[#8a8178]">
                        {formatMoney(product.priceCents, settings.currency)} · {product.stock}{" "}
                        {product.stock === 1 ? "disponible" : "disponibles"} ·{" "}
                        {product.published ? "Visible" : "Oculto"}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
          <Link
            href={`/admin/productos/nuevo?categoria=${category.id}`}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#cfc6ba] py-3 text-sm text-[#6f675f]"
          >
            <span aria-hidden="true">+</span>
            Agregar regalo
          </Link>
        </section>
      ))}
      <form action={saveCategoryAction} className="rounded-2xl border border-dashed border-[#e4dcd0] p-4">
        <h2 className="font-serif text-2xl">Nueva categoría</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            Nombre
            <input name="name" required className={fieldClass} />
          </label>
          <label className="text-sm">
            Ancho
            <select name="span" defaultValue="half" className={fieldClass}>
              <option value="full">Completo</option>
              <option value="half">Mitad</option>
              <option value="third">Tercio</option>
            </select>
          </label>
          <label className="text-sm">
            Orden
            <input name="sort" type="number" defaultValue={100} className={fieldClass} />
          </label>
          <button className="rounded-full bg-[#3f3a34] px-4 py-2 text-sm text-[#f7f3ec]">Agregar</button>
        </div>
      </form>
    </div>
  );
}

const fieldClass = "mt-1 block rounded-xl border border-[#e4dcd0] bg-white/70 px-3 py-2";
