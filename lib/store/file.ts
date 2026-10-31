import "server-only";

import { randomUUID } from "crypto";
import { mkdir, readFile, rename, rm, writeFile } from "fs/promises";
import path from "path";
import { makeCode } from "../codes";
import { rateOr } from "../format";
import { mergeQuantities } from "../catalog";
import { initialData } from "../seed-data";
import type {
  Category,
  Order,
  OrderStatus,
  Product,
  Settings,
  StoreData,
} from "../types";

const filePath = path.join(process.cwd(), ".data", "store.json");
let queue: Promise<unknown> = Promise.resolve();

function locked<T>(task: () => Promise<T>) {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readData() {
  try {
    const data = JSON.parse(await readFile(filePath, "utf8")) as StoreData;
    data.settings = {
      ...data.settings,
      copPerUsd: rateOr(data.settings.copPerUsd, 4000),
      hnlPerUsd: rateOr(data.settings.hnlPerUsd, 26),
    };
    return data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const data = initialData();
    await persist(data);
    return data;
  }
}

async function persist(data: StoreData) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.tmp`;
  await writeFile(temporary, JSON.stringify(data, null, 2));
  try {
    await rename(temporary, filePath);
  } catch {
    await rm(filePath, { force: true });
    await rename(temporary, filePath);
  }
}

export const fileStore = {
  async getSettings() {
    return (await readData()).settings;
  },
  async saveSettings(settings: Settings) {
    await locked(async () => {
      const data = await readData();
      data.settings = settings;
      await persist(data);
    });
  },
  async getData() {
    return readData();
  },
  async getProduct(id: string) {
    return (await readData()).products.find((product) => product.id === id) ?? null;
  },
  async saveProduct(product: Product) {
    await locked(async () => {
      const data = await readData();
      const index = data.products.findIndex((item) => item.id === product.id);
      if (index === -1) data.products.push(product);
      else data.products[index] = product;
      await persist(data);
    });
  },
  async deleteProduct(id: string) {
    await locked(async () => {
      const data = await readData();
      data.products = data.products.filter((product) => product.id !== id);
      await persist(data);
    });
  },
  async saveCategory(category: Category) {
    await locked(async () => {
      const data = await readData();
      const index = data.categories.findIndex((item) => item.id === category.id);
      if (index === -1) data.categories.push(category);
      else data.categories[index] = category;
      await persist(data);
    });
  },
  async deleteCategory(id: string) {
    return locked(async () => {
      const data = await readData();
      if (data.products.some((product) => product.categoryId === id)) {
        return {
          ok: false as const,
          error: "Quita los regalos de esta categoría primero.",
        };
      }
      data.categories = data.categories.filter((category) => category.id !== id);
      await persist(data);
      return { ok: true as const };
    });
  },
  async confirm(input: {
    name: string;
    email: string;
    message: string;
    items: { productId: string; quantity: number }[];
  }) {
    return locked(async () => {
      const data = await readData();
      const wanted = mergeQuantities(input.items);
      const unavailable: { id: string; name: string }[] = [];
      const chosen: { product: Product; quantity: number }[] = [];

      for (const item of wanted) {
        const product = data.products.find((entry) => entry.id === item.productId);
        if (!product || !product.published || product.stock < item.quantity) {
          unavailable.push({ id: item.productId, name: product?.name ?? "Regalo" });
        } else {
          chosen.push({ product, quantity: item.quantity });
        }
      }

      if (unavailable.length > 0) {
        return {
          ok: false as const,
          error: "Algunos regalos ya no están disponibles.",
          unavailable,
        };
      }

      const order = createOrder(input, chosen, data.orders.map((entry) => entry.code));
      for (const line of chosen) line.product.stock -= line.quantity;
      data.orders.unshift(order);
      await persist(data);
      return { ok: true as const, order };
    });
  },
  async getOrderByCode(code: string) {
    return (await readData()).orders.find((order) => order.code === code) ?? null;
  },
  async listOrders() {
    return (await readData()).orders;
  },
  async getOrder(id: string) {
    return (await readData()).orders.find((order) => order.id === id) ?? null;
  },
  async setOrderStatus(id: string, status: OrderStatus) {
    await locked(async () => {
      const data = await readData();
      const order = data.orders.find((entry) => entry.id === id);
      if (order) order.status = status;
      await persist(data);
    });
  },
  async releaseOrder(id: string) {
    await locked(async () => {
      const data = await readData();
      const order = data.orders.find((entry) => entry.id === id);
      if (!order) return;
      for (const item of order.items) {
        const product = data.products.find((entry) => entry.id === item.productId);
        if (product) product.stock += item.quantity;
      }
      data.orders = data.orders.filter((entry) => entry.id !== id);
      await persist(data);
    });
  },
};

function createOrder(
  input: { name: string; email: string; message: string },
  lines: { product: Product; quantity: number }[],
  taken: string[],
) {
  let code = makeCode();
  while (taken.includes(code)) code = makeCode();
  const items = lines.map((line) => ({
    id: randomUUID(),
    productId: line.product.id,
    name: line.product.name,
    quantity: line.quantity,
    priceCents: line.product.priceCents,
  }));
  const order: Order = {
    id: randomUUID(),
    code,
    guestName: input.name,
    guestEmail: input.email,
    message: input.message,
    totalCents: items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    status: "pendiente",
    guestEmailSent: false,
    ownerEmailSent: false,
    emailNote: "",
    createdAt: new Date().toISOString(),
    items,
  };
  return order;
}
