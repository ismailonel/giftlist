import { notFound } from "next/navigation";
import { ProductForm } from "@/components/product-form";
import { requireAdmin } from "@/lib/auth";
import { adminCatalog, getProduct } from "@/lib/store";

export const instant = false;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [product, data] = await Promise.all([getProduct(id), adminCatalog()]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 font-serif text-4xl">Editar regalo</h1>
      <ProductForm product={product} categories={data.categories} />
    </div>
  );
}
