import "server-only";

import { randomUUID } from "crypto";
import { mergeQuantities, spanOf } from "../catalog";
import { makeCode } from "../codes";
import { rateOr } from "../format";
import { getSupabase } from "../db/supabase";
import { initialData } from "../seed-data";
import type { Category, Order, OrderStatus, Product, Settings, StoreData } from "../types";

type Row = Record<string, unknown>;

class StockConflict extends Error {
  constructor(readonly unavailable: { id: string; name: string }[]) {
    super("stock");
  }
}

function raise(error: { message: string } | null, action: string) {
  if (!error) return;
  const exposed = /pg_pgrst_no_exposed_schemas|Invalid schema/i.test(error.message);
  const hint = exposed ? " Supabase Data API'de public şemasını aç." : "";
  throw new Error(`${action}: ${error.message}${hint}`);
}

function client() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY");
  return supabase;
}

function text(row: Row, key: string) {
  const value = row[key];
  return typeof value === "string" ? value : "";
}

function number(row: Row, key: string) {
  const value = row[key];
  return typeof value === "number" ? value : Number(value ?? 0);
}

function flag(row: Row, key: string) {
  return row[key] === true;
}

function settingsFrom(row: Row): Settings {
  return {
    monogram: text(row, "monogram"),
    siteName: text(row, "site_name"),
    title: text(row, "title"),
    subtitle: text(row, "subtitle"),
    scriptNote: text(row, "script_note"),
    footerLine: text(row, "footer_line"),
    currency: text(row, "currency") || "USD",
    copPerUsd: rateOr(row.cop_per_usd, 4000),
    hnlPerUsd: rateOr(row.hnl_per_usd, 26),
    notifyEmail: text(row, "notify_email"),
    bankName: text(row, "bank_name"),
    accountHolder: text(row, "account_holder"),
    accountNumber: text(row, "account_number"),
    bankNote: text(row, "bank_note"),
    guestTemplate: text(row, "guest_template"),
    ownerTemplate: text(row, "owner_template"),
    thanksMessage: text(row, "thanks_message"),
  };
}

function settingsToDb(value: Settings) {
  return {
    id: "default",
    monogram: value.monogram,
    site_name: value.siteName,
    title: value.title,
    subtitle: value.subtitle,
    script_note: value.scriptNote,
    footer_line: value.footerLine,
    currency: value.currency,
    cop_per_usd: String(value.copPerUsd),
    hnl_per_usd: String(value.hnlPerUsd),
    notify_email: value.notifyEmail,
    bank_name: value.bankName,
    account_holder: value.accountHolder,
    account_number: value.accountNumber,
    bank_note: value.bankNote,
    guest_template: value.guestTemplate,
    owner_template: value.ownerTemplate,
    thanks_message: value.thanksMessage,
  };
}

function categoryFrom(row: Row): Category {
  return {
    id: text(row, "id"),
    name: text(row, "name"),
    sort: number(row, "sort"),
    span: spanOf(text(row, "span")),
  };
}

function productFrom(row: Row): Product {
  return {
    id: text(row, "id"),
    categoryId: text(row, "category_id"),
    name: text(row, "name"),
    priceCents: number(row, "price_cents"),
    stock: number(row, "stock"),
    imageUrl: text(row, "image_url"),
    amazonUrl: text(row, "amazon_url"),
    published: flag(row, "published"),
    sort: number(row, "sort"),
  };
}

function productToDb(product: Product) {
  return {
    id: product.id,
    category_id: product.categoryId,
    name: product.name,
    price_cents: product.priceCents,
    stock: product.stock,
    image_url: product.imageUrl,
    amazon_url: product.amazonUrl,
    published: product.published,
    sort: product.sort,
  };
}

function orderFrom(row: Row, items: Row[]): Order {
  const status = text(row, "status");
  return {
    id: text(row, "id"),
    code: text(row, "code"),
    guestName: text(row, "guest_name"),
    guestEmail: text(row, "guest_email"),
    message: text(row, "message"),
    totalCents: number(row, "total_cents"),
    status: status === "recibido" ? "recibido" : "pendiente",
    guestEmailSent: flag(row, "guest_email_sent"),
    ownerEmailSent: flag(row, "owner_email_sent"),
    emailNote: text(row, "email_note"),
    createdAt: text(row, "created_at"),
    items: items.map((item) => ({
      id: text(item, "id"),
      productId: text(item, "product_id"),
      name: text(item, "name"),
      quantity: number(item, "quantity"),
      priceCents: number(item, "price_cents"),
    })),
  };
}

async function seedIfEmpty(supabase: NonNullable<ReturnType<typeof getSupabase>>) {
  const existing = await supabase.from("settings").select("id").limit(1);
  raise(existing.error, "settings");
  if ((existing.data ?? []).length > 0) return;

  const data = initialData();
  const inserted = await supabase.from("settings").insert(settingsToDb(data.settings)).select("id");
  if (inserted.error?.code === "23505") return;
  raise(inserted.error, "settings");
  if ((inserted.data ?? []).length === 0) return;

  const categories = await supabase.from("categories").insert(
    data.categories.map((category) => ({
      id: category.id,
      name: category.name,
      sort: category.sort,
      span: category.span,
    })),
  );
  raise(categories.error, "categories");
  const products = await supabase.from("products").insert(data.products.map(productToDb));
  raise(products.error, "products");
}

async function returnStock(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  productId: string,
  quantity: number,
) {
  if (!productId || quantity <= 0) return;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const current = await supabase.from("products").select("stock").eq("id", productId).limit(1);
    raise(current.error, "products");
    const row = (current.data ?? [])[0] as Row | undefined;
    if (!row) return;
    const stock = number(row, "stock");
    const saved = await supabase.from("products").update({ stock: stock + quantity }).eq("id", productId).eq("stock", stock).select("id");
    raise(saved.error, "products");
    if ((saved.data ?? []).length > 0) return;
  }
  throw new Error("products: no se pudo devolver el stock");
}

async function ready() {
  const supabase = client();
  await seedIfEmpty(supabase);
  return supabase;
}

async function load(): Promise<StoreData> {
  const supabase = await ready();
  const [settingRows, categoryRows, productRows, orderRows, itemRows] = await Promise.all([
    supabase.from("settings").select("*").limit(1),
    supabase.from("categories").select("*").order("sort"),
    supabase.from("products").select("*").order("sort"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("order_items").select("*"),
  ]);
  raise(settingRows.error, "settings");
  raise(categoryRows.error, "categories");
  raise(productRows.error, "products");
  raise(orderRows.error, "orders");
  raise(itemRows.error, "order_items");
  const items = (itemRows.data ?? []) as Row[];
  return {
    settings: settingRows.data?.[0] ? settingsFrom(settingRows.data[0] as Row) : initialData().settings,
    categories: ((categoryRows.data ?? []) as Row[]).map(categoryFrom),
    products: ((productRows.data ?? []) as Row[]).map(productFrom),
    orders: ((orderRows.data ?? []) as Row[]).map((row) =>
      orderFrom(
        row,
        items.filter((item) => text(item, "order_id") === text(row, "id")),
      ),
    ),
  };
}

async function restoreStock(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  previous: { id: string; stock: number }[],
) {
  for (const line of previous) {
    const restored = await supabase.from("products").update({ stock: line.stock }).eq("id", line.id);
    raise(restored.error, "products");
  }
}

export const supabaseStore = {
  async getSettings() {
    const data = await load();
    return data.settings;
  },
  async saveSettings(next: Settings) {
    const supabase = await ready();
    const saved = await supabase.from("settings").upsert(settingsToDb(next), { onConflict: "id" });
    raise(saved.error, "settings");
  },
  async getData() {
    return load();
  },
  async getProduct(id: string) {
    const data = await load();
    return data.products.find((product) => product.id === id) ?? null;
  },
  async saveProduct(product: Product) {
    const supabase = await ready();
    const saved = await supabase.from("products").upsert(productToDb(product), { onConflict: "id" });
    raise(saved.error, "products");
  },
  async deleteProduct(id: string) {
    const supabase = await ready();
    const removed = await supabase.from("products").delete().eq("id", id);
    raise(removed.error, "products");
  },
  async saveCategory(category: Category) {
    const supabase = await ready();
    const saved = await supabase.from("categories").upsert(
      { id: category.id, name: category.name, sort: category.sort, span: category.span },
      { onConflict: "id" },
    );
    raise(saved.error, "categories");
  },
  async deleteCategory(id: string) {
    const supabase = await ready();
    const used = await supabase.from("products").select("id").eq("category_id", id).limit(1);
    raise(used.error, "products");
    if ((used.data ?? []).length > 0) {
      return { ok: false as const, error: "Quita los regalos de esta categoría primero." };
    }
    const removed = await supabase.from("categories").delete().eq("id", id);
    raise(removed.error, "categories");
    return { ok: true as const };
  },
  async confirm(input: {
    name: string;
    email: string;
    message: string;
    items: { productId: string; quantity: number }[];
  }) {
    const supabase = await ready();
    const wanted = mergeQuantities(input.items);
    try {
      const found = await supabase
        .from("products")
        .select("*")
        .in(
          "id",
          wanted.map((item) => item.productId),
        );
      raise(found.error, "products");
      const products = new Map(((found.data ?? []) as Row[]).map((row) => [text(row, "id"), productFrom(row)]));
      const unavailable: { id: string; name: string }[] = [];
      const chosen: { product: Product; quantity: number }[] = [];
      for (const item of wanted) {
        const product = products.get(item.productId) ?? null;
        if (!product || !product.published || product.stock < item.quantity) {
          unavailable.push({ id: item.productId, name: product?.name ?? "Regalo" });
        } else {
          chosen.push({ product, quantity: item.quantity });
        }
      }
      if (unavailable.length > 0) throw new StockConflict(unavailable);

      const reserved: { id: string; stock: number }[] = [];
      for (const line of chosen) {
        const nextStock = line.product.stock - line.quantity;
        const updated = await supabase
          .from("products")
          .update({ stock: nextStock })
          .eq("id", line.product.id)
          .eq("stock", line.product.stock)
          .select("id");
        raise(updated.error, "products");
        if ((updated.data ?? []).length === 0) {
          await restoreStock(supabase, reserved);
          throw new StockConflict([{ id: line.product.id, name: line.product.name }]);
        }
        reserved.push({ id: line.product.id, stock: line.product.stock });
      }

      let code = makeCode();
      const orderId = randomUUID();
      const createdAt = new Date().toISOString();
      const items = chosen.map((line) => ({
        id: randomUUID(),
        order_id: orderId,
        product_id: line.product.id,
        name: line.product.name,
        quantity: line.quantity,
        price_cents: line.product.priceCents,
      }));
      const totalCents = items.reduce((sum, item) => sum + item.price_cents * item.quantity, 0);
      const orderRow = {
        id: orderId,
        code,
        guest_name: input.name,
        guest_email: input.email,
        message: input.message,
        total_cents: totalCents,
        status: "pendiente",
        guest_email_sent: false,
        owner_email_sent: false,
        email_note: "",
        created_at: createdAt,
      };

      let inserted = false;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        orderRow.code = code;
        const saved = await supabase.from("orders").insert(orderRow);
        if (!saved.error) {
          inserted = true;
          break;
        }
        if (saved.error.code !== "23505") {
          await restoreStock(supabase, reserved);
          raise(saved.error, "orders");
        }
        code = makeCode();
      }
      if (!inserted) {
        await restoreStock(supabase, reserved);
        throw new Error("orders: no se pudo crear un código");
      }

      const savedItems = await supabase.from("order_items").insert(items);
      if (savedItems.error) {
        await supabase.from("orders").delete().eq("id", orderId);
        await restoreStock(supabase, reserved);
        raise(savedItems.error, "order_items");
      }

      const order: Order = {
        id: orderId,
        code,
        guestName: input.name,
        guestEmail: input.email,
        message: input.message,
        totalCents,
        status: "pendiente",
        guestEmailSent: false,
        ownerEmailSent: false,
        emailNote: "",
        createdAt,
        items: items.map((item) => ({
          id: item.id,
          productId: item.product_id,
          name: item.name,
          quantity: item.quantity,
          priceCents: item.price_cents,
        })),
      };
      return { ok: true as const, order };
    } catch (error) {
      if (error instanceof StockConflict) {
        return {
          ok: false as const,
          error: "Algunos regalos ya no están disponibles.",
          unavailable: error.unavailable,
        };
      }
      throw error;
    }
  },
  async getOrderByCode(code: string) {
    const data = await load();
    return data.orders.find((order) => order.code === code) ?? null;
  },
  async listOrders() {
    return (await load()).orders;
  },
  async getOrder(id: string) {
    const data = await load();
    return data.orders.find((order) => order.id === id) ?? null;
  },
  async setOrderStatus(id: string, status: OrderStatus) {
    const supabase = await ready();
    const saved = await supabase.from("orders").update({ status }).eq("id", id);
    raise(saved.error, "orders");
  },
  async releaseOrder(id: string) {
    const supabase = await ready();
    const items = await supabase.from("order_items").select("product_id, quantity").eq("order_id", id);
    raise(items.error, "order_items");
    const removed = await supabase.from("orders").delete().eq("id", id).select("id");
    raise(removed.error, "orders");
    if ((removed.data ?? []).length === 0) return;

    for (const item of (items.data ?? []) as Row[]) {
      await returnStock(supabase, text(item, "product_id"), number(item, "quantity"));
    }
    const cleared = await supabase.from("order_items").delete().eq("order_id", id);
    raise(cleared.error, "order_items");
  },
};
