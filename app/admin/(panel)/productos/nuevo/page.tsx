import { ProductForm } from "@/components/product-form";
import { requireAdmin } from "@/lib/auth";
import { adminCatalog } from "@/lib/store";

export const instant = false;

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  await requireAdmin();
  const { categoria } = await searchParams;
  const data = await adminCatalog();
  const categoryId = data.categories.some((category) => category.id === categoria) ? categoria : undefined;
  const nextSort =
    Math.max(
      0,
      ...data.products.filter((product) => product.categoryId === categoryId).map((product) => product.sort),
    ) + 10;

  return (
    <div>
      <h1 className="mb-6 font-serif text-4xl">Nuevo regalo</h1>
      <ProductForm
        product={null}
        categories={data.categories}
        defaultCategoryId={categoryId}
        defaultSort={nextSort}
      />
    </div>
  );
}
