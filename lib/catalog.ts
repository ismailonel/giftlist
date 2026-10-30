import type { CatalogCategory, Span, StoreData } from "./types";

export function spanOf(value: string): Span {
  if (value === "half" || value === "third") return value;
  return "full";
}

export function toCatalog(data: Pick<StoreData, "categories" | "products">): CatalogCategory[] {
  return data.categories
    .slice()
    .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, "es"))
    .map((category) => ({
      id: category.id,
      name: category.name,
      sort: category.sort,
      span: spanOf(category.span),
      products: data.products
        .filter(
          (product) =>
            product.categoryId === category.id &&
            product.published &&
            product.stock > 0 &&
            product.imageUrl.trim() !== "",
        )
        .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, "es"))
        .map((product) => ({
          id: product.id,
          name: product.name,
          priceCents: product.priceCents,
          stock: product.stock,
          imageUrl: product.imageUrl,
        })),
    }))
    .filter((category) => category.products.length > 0);
}

export function mergeQuantities(items: { productId: string; quantity: number }[]) {
  const map = new Map<string, number>();
  for (const item of items) {
    map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
  }
  return Array.from(map, ([productId, quantity]) => ({ productId, quantity }));
}
