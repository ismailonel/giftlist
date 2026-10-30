import "server-only";

import { randomUUID } from "crypto";
import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { makeCode } from "../codes";
import { mergeQuantities } from "../catalog";
import { ensureDatabase, getDb } from "../db/client";
import { categories, orderItems, orders, products, settings } from "../db/schema";
import { initialData } from "../seed-data";
import type {
  Category,
  Order,
  OrderStatus,
  Product,
  Settings,
  Span,
  StoreData,
} from "../types";
import { spanOf } from "../catalog";

class StockConflict extends Error {
  constructor(readonly unavailable: { id: string; name: string }[]) {
    super("stock");
  }
}

async function db() {
  await ensureDatabase();
  const database = getDb();
  if (!database) throw new Error("Falta DATABASE_URL");
  await seedIfEmpty(database);
  return database;
}

async function seedIfEmpty(database: NonNullable<ReturnType<typeof getDb>>) {
  const existing = await database.select({ id: settings.id }).from(settings).limit(1);
  if (existing.length > 0) return;
  const data = initialData();
  const inserted = await database
    .insert(settings)
    .values(settingsRow(data.settings))
    .onConflictDoNothing()
    .returning({ id: settings.id });
  if (inserted.length === 0) return;
  await database.insert(categories).values(data.categories.map(categoryRow));
  await database.insert(products).values(data.products.map(productRow));
}

export const dbStore = {
  async getSettings() {
    const database = await db();
    const [row] = await database.select().from(settings).limit(1);
    if (!row) return initialData().settings;
    return settingsFrom(row);
  },
  async saveSettings(next: Settings) {
    const database = await db();
    await database
      .insert(settings)
      .values(settingsRow(next))
      .onConflictDoUpdate({ target: settings.id, set: settingsRow(next) });
  },
  async getData(): Promise<StoreData> {
    const database = await db();
    const [settingRows, categoryRows, productRows, orderRows, itemRows] = await Promise.all([
      database.select().from(settings).limit(1),
      database.select().from(categories).orderBy(asc(categories.sort)),
      database.select().from(products).orderBy(asc(products.sort)),
      database.select().from(orders).orderBy(desc(orders.createdAt)),
      database.select().from(orderItems),
    ]);
    return {
      settings: settingRows[0] ? settingsFrom(settingRows[0]) : initialData().settings,
      categories: categoryRows.map(categoryFrom),
      products: productRows.map(productFrom),
      orders: orderRows.map((row) => orderFrom(row, itemRows.filter((item) => item.orderId === row.id))),
    };
  },
  async getProduct(id: string) {
    const database = await db();
    const [row] = await database.select().from(products).where(eq(products.id, id)).limit(1);
    return row ? productFrom(row) : null;
  },
  async saveProduct(product: Product) {
    const database = await db();
    const row = productRow(product);
    await database.insert(products).values(row).onConflictDoUpdate({
      target: products.id,
      set: row,
    });
  },
  async deleteProduct(id: string) {
    const database = await db();
    await database.delete(products).where(eq(products.id, id));
  },
  async saveCategory(category: Category) {
    const database = await db();
    const row = categoryRow(category);
    await database.insert(categories).values(row).onConflictDoUpdate({
      target: categories.id,
      set: row,
    });
  },
  async deleteCategory(id: string) {
    const database = await db();
    const used = await database
      .select({ id: products.id })
      .from(products)
      .where(eq(products.categoryId, id))
      .limit(1);
    if (used.length > 0) {
      return { ok: false as const, error: "Quita los regalos de esta categoría primero." };
    }
    await database.delete(categories).where(eq(categories.id, id));
    return { ok: true as const };
  },
  async confirm(input: {
    name: string;
    email: string;
    message: string;
    items: { productId: string; quantity: number }[];
  }) {
    const database = await db();
    const wanted = mergeQuantities(input.items);
    try {
      const order = await database.transaction(async (tx) => {
        const unavailable: { id: string; name: string }[] = [];
        const chosen: { product: Product; quantity: number }[] = [];
        for (const item of wanted) {
          const [row] = await tx
            .select()
            .from(products)
            .where(eq(products.id, item.productId))
            .for("update")
            .limit(1);
          const product = row ? productFrom(row) : null;
          if (!product || !product.published || product.stock < item.quantity) {
            unavailable.push({ id: item.productId, name: product?.name ?? "Regalo" });
          } else {
            chosen.push({ product, quantity: item.quantity });
          }
        }
        if (unavailable.length > 0) throw new StockConflict(unavailable);

        let code = makeCode();
        for (let attempt = 0; attempt < 5; attempt += 1) {
          const [existing] = await tx
            .select({ id: orders.id })
            .from(orders)
            .where(eq(orders.code, code))
            .limit(1);
          if (!existing) break;
          code = makeCode();
        }

        const orderId = randomUUID();
        const createdAt = new Date();
        const items = chosen.map((line) => ({
          id: randomUUID(),
          orderId,
          productId: line.product.id,
          name: line.product.name,
          quantity: line.quantity,
          priceCents: line.product.priceCents,
        }));
        const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

        for (const line of chosen) {
          const updated = await tx
            .update(products)
            .set({ stock: sql`${products.stock} - ${line.quantity}` })
            .where(and(eq(products.id, line.product.id), gte(products.stock, line.quantity)))
            .returning({ id: products.id });
          if (updated.length === 0) {
            throw new StockConflict([{ id: line.product.id, name: line.product.name }]);
          }
        }

        await tx.insert(orders).values({
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
        });
        await tx.insert(orderItems).values(items);

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
          createdAt: createdAt.toISOString(),
          items: items.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            priceCents: item.priceCents,
          })),
        };
        return order;
      });
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
    const data = await this.getData();
    return data.orders.find((order) => order.code === code) ?? null;
  },
  async listOrders() {
    return (await this.getData()).orders;
  },
  async getOrder(id: string) {
    const data = await this.getData();
    return data.orders.find((order) => order.id === id) ?? null;
  },
  async setOrderStatus(id: string, status: OrderStatus) {
    const database = await db();
    await database.update(orders).set({ status }).where(eq(orders.id, id));
  },
  async markEmail(
    id: string,
    result: { guestEmailSent: boolean; ownerEmailSent: boolean; emailNote: string },
  ) {
    const database = await db();
    await database
      .update(orders)
      .set({
        guestEmailSent: result.guestEmailSent,
        ownerEmailSent: result.ownerEmailSent,
        emailNote: result.emailNote,
      })
      .where(eq(orders.id, id));
  },
};

function settingsRow(value: Settings) {
  return {
    id: "default",
    monogram: value.monogram,
    siteName: value.siteName,
    title: value.title,
    subtitle: value.subtitle,
    scriptNote: value.scriptNote,
    footerLine: value.footerLine,
    currency: value.currency,
    notifyEmail: value.notifyEmail,
    bankName: value.bankName,
    accountHolder: value.accountHolder,
    accountNumber: value.accountNumber,
    bankNote: value.bankNote,
    guestTemplate: value.guestTemplate,
    ownerTemplate: value.ownerTemplate,
    thanksMessage: value.thanksMessage,
  };
}

function settingsFrom(row: typeof settings.$inferSelect): Settings {
  return {
    monogram: row.monogram,
    siteName: row.siteName,
    title: row.title,
    subtitle: row.subtitle,
    scriptNote: row.scriptNote,
    footerLine: row.footerLine,
    currency: row.currency,
    notifyEmail: row.notifyEmail,
    bankName: row.bankName,
    accountHolder: row.accountHolder,
    accountNumber: row.accountNumber,
    bankNote: row.bankNote,
    guestTemplate: row.guestTemplate,
    ownerTemplate: row.ownerTemplate,
    thanksMessage: row.thanksMessage || "",
  };
}

function categoryRow(category: Category) {
  return {
    id: category.id,
    name: category.name,
    sort: category.sort,
    span: category.span,
  };
}

function categoryFrom(row: typeof categories.$inferSelect): Category {
  return {
    id: row.id,
    name: row.name,
    sort: row.sort,
    span: spanOf(row.span) satisfies Span,
  };
}

function productRow(product: Product) {
  return {
    id: product.id,
    categoryId: product.categoryId,
    name: product.name,
    priceCents: product.priceCents,
    stock: product.stock,
    imageUrl: product.imageUrl,
    amazonUrl: product.amazonUrl,
    published: product.published,
    sort: product.sort,
  };
}

function productFrom(row: typeof products.$inferSelect): Product {
  return {
    id: row.id,
    categoryId: row.categoryId,
    name: row.name,
    priceCents: row.priceCents,
    stock: row.stock,
    imageUrl: row.imageUrl,
    amazonUrl: row.amazonUrl,
    published: row.published,
    sort: row.sort,
  };
}

function orderFrom(
  row: typeof orders.$inferSelect,
  items: (typeof orderItems.$inferSelect)[],
): Order {
  return {
    id: row.id,
    code: row.code,
    guestName: row.guestName,
    guestEmail: row.guestEmail,
    message: row.message,
    totalCents: row.totalCents,
    status: row.status === "recibido" ? "recibido" : "pendiente",
    guestEmailSent: row.guestEmailSent,
    ownerEmailSent: row.ownerEmailSent,
    emailNote: row.emailNote,
    createdAt: row.createdAt.toISOString(),
    items: items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      priceCents: item.priceCents,
    })),
  };
}
