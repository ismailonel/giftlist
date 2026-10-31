import "server-only";

import { toCatalog } from "../catalog";
import { hasDatabase } from "../db/client";
import { hasSupabase } from "../db/supabase";
import { initialData } from "../seed-data";
import type { Category, OrderStatus, Product, Settings } from "../types";
import { dbStore } from "./db";
import { fileStore } from "./file";
import { supabaseStore } from "./supabase";

function backend() {
  if (hasSupabase()) return supabaseStore;
  if (hasDatabase()) return dbStore;
  if (process.env.VERCEL) return null;
  return fileStore;
}

function missingDatabase() {
  return {
    ok: false as const,
    error: "La lista todavía no está lista para apartar regalos.",
    unavailable: [] as { id: string; name: string }[],
  };
}

export async function getSettings(): Promise<Settings> {
  const store = backend();
  if (!store) return initialData().settings;
  return store.getSettings();
}

export async function saveSettings(settings: Settings) {
  const store = backend();
  if (!store) throw new Error("Falta DATABASE_URL");
  await store.saveSettings(settings);
}

export async function getPublicCatalog() {
  const store = backend();
  if (!store) return toCatalog(initialData());
  return toCatalog(await store.getData());
}

export async function adminCatalog() {
  const store = backend();
  if (!store) return initialData();
  return store.getData();
}

export async function getProduct(id: string) {
  const store = backend();
  if (!store) return null;
  return store.getProduct(id);
}

export async function saveProduct(product: Product) {
  const store = backend();
  if (!store) throw new Error("Falta DATABASE_URL");
  await store.saveProduct(product);
}

export async function deleteProduct(id: string) {
  const store = backend();
  if (!store) throw new Error("Falta DATABASE_URL");
  await store.deleteProduct(id);
}

export async function saveCategory(category: Category) {
  const store = backend();
  if (!store) throw new Error("Falta DATABASE_URL");
  await store.saveCategory(category);
}

export async function deleteCategory(id: string) {
  const store = backend();
  if (!store) return { ok: false as const, error: "Falta DATABASE_URL" };
  return store.deleteCategory(id);
}

export async function confirmSelection(input: {
  name: string;
  email: string;
  message: string;
  items: { productId: string; quantity: number }[];
}) {
  const store = backend();
  if (!store) return missingDatabase();
  return store.confirm(input);
}

export async function getOrderByCode(code: string) {
  const store = backend();
  if (!store) return null;
  return store.getOrderByCode(code);
}

export async function listOrders() {
  const store = backend();
  if (!store) return [];
  return store.listOrders();
}

export async function getOrder(id: string) {
  const store = backend();
  if (!store) return null;
  return store.getOrder(id);
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  const store = backend();
  if (!store) throw new Error("Falta DATABASE_URL");
  await store.setOrderStatus(id, status);
}

export async function releaseOrder(id: string) {
  const store = backend();
  if (!store) throw new Error("Falta DATABASE_URL");
  await store.releaseOrder(id);
}

export async function markEmail(
  id: string,
  result: { guestEmailSent: boolean; ownerEmailSent: boolean; emailNote: string },
) {
  const store = backend();
  if (!store) return;
  await store.markEmail(id, result);
}
