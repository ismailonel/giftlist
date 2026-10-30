import { ProductForm } from "@/components/product-form";
import { requireAdmin } from "@/lib/auth";
import { adminCatalog } from "@/lib/store";

export const instant = false;

export default async function NewProductPage() {
  await requireAdmin();
  const data = await adminCatalog();

  return (
    <div>
      <h1 className="mb-6 font-serif text-4xl">Nuevo regalo</h1>
      <ProductForm product={null} categories={data.categories} />
    </div>
  );
}
