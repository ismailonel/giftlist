"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminPassword, passwordsMatch, requireAdmin } from "@/lib/auth";
import { importAmazonProduct } from "@/lib/amazon";
import { dollarsToCents, parseTurkishRate } from "@/lib/format";
import { storeImage } from "@/lib/images";
import { SESSION_COOKIE, sessionSecret, signAdminSession } from "@/lib/session";
import {
  confirmSelection,
  deleteCategory,
  deleteProduct,
  getSettings,
  saveCategory,
  saveProduct,
  saveSettings,
  releaseOrder,
  setOrderStatus,
} from "@/lib/store";
import type { OrderStatus, Settings, Span } from "@/lib/types";

const confirmSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(80),
  email: z.union([z.literal(""), z.string().trim().email("Escribe un correo válido.").max(160)]),
  message: z.string().trim().max(2000),
  website: z.string().max(0),
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(80),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Tu bolsa está vacía.")
    .max(30),
});

export async function confirmGifts(input: {
  name: string;
  email: string;
  message: string;
  website: string;
  items: { productId: string; quantity: number }[];
}) {
  const parsed = confirmSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Revisa los datos.",
      unavailable: [] as { id: string; name: string }[],
    };
  }

  const result = await confirmSelection({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    message: parsed.data.message,
    items: parsed.data.items,
  });

  if (!result.ok) return result;

  revalidatePath("/");
  revalidatePath("/gracias");
  return { ok: true as const, code: result.order.code };
}

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = adminPassword();
  if (!expected || !sessionSecret()) redirect("/admin/login?error=config");
  if (!passwordsMatch(password, expected)) redirect("/admin/login?error=1");
  const token = await signAdminSession();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  redirect("/admin/productos");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function importFromAmazon(url: string) {
  await requireAdmin();
  return importAmazonProduct(url);
}

export async function uploadProductImage(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, error: "Elige una imagen." };
  }
  try {
    const url = await storeImage(new Uint8Array(await file.arrayBuffer()), file.type);
    return { ok: true as const, url };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "No se pudo guardar la imagen.",
    };
  }
}

const productSchema = z.object({
  id: z.string().max(80),
  categoryId: z.string().min(1),
  name: z.string().trim().min(2).max(140),
  price: z.string().trim(),
  stock: z.coerce.number().int().min(0).max(999),
  imageUrl: z.string().trim().max(500),
  amazonUrl: z.string().trim().max(500),
  sort: z.coerce.number().int().min(0).max(9999),
  published: z.boolean(),
});

export async function saveProductAction(input: z.infer<typeof productSchema>) {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Revisa los datos del regalo." };
  const priceCents = dollarsToCents(parsed.data.price);
  if (priceCents == null) return { ok: false as const, error: "Escribe un precio válido." };
  if (parsed.data.published && !parsed.data.imageUrl) {
    return { ok: false as const, error: "Agrega una imagen antes de publicarlo." };
  }
  await saveProduct({
    id: parsed.data.id || randomUUID(),
    categoryId: parsed.data.categoryId,
    name: parsed.data.name,
    priceCents,
    stock: parsed.data.stock,
    imageUrl: parsed.data.imageUrl,
    amazonUrl: parsed.data.amazonUrl,
    published: parsed.data.published,
    sort: parsed.data.sort,
  });
  revalidatePath("/");
  revalidatePath("/admin/productos");
  return { ok: true as const };
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  await deleteProduct(id);
  revalidatePath("/");
  revalidatePath("/admin/productos");
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const span = String(formData.get("span") ?? "full");
  const sort = Number(formData.get("sort") ?? 0);
  if (name.length < 2 || !["full", "half", "third"].includes(span) || !Number.isInteger(sort)) {
    redirect("/admin/productos?error=categoria");
  }
  await saveCategory({
    id: String(formData.get("id") ?? "") || randomUUID(),
    name,
    span: span as Span,
    sort,
  });
  revalidatePath("/");
  revalidatePath("/admin/productos");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const result = await deleteCategory(String(formData.get("id") ?? ""));
  revalidatePath("/");
  revalidatePath("/admin/productos");
  if (!result.ok) redirect("/admin/productos?error=categoria-uso");
}

const settingsSchema = z.object({
  monogram: z.string().trim().min(1).max(4),
  siteName: z.string().trim().min(2).max(80),
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().min(2).max(180),
  scriptNote: z.string().trim().max(180),
  footerLine: z.string().trim().max(180),
  currency: z.literal("USD"),
  copPerUsd: z.number().positive(),
  hnlPerUsd: z.number().positive(),
  bankName: z.string().trim().max(120),
  accountHolder: z.string().trim().max(120),
  accountNumber: z.string().trim().max(80),
  bankNote: z.string().trim().max(500),
  thanksMessage: z.string().trim().max(300),
});

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    monogram: formData.get("monogram"),
    siteName: formData.get("siteName"),
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    scriptNote: formData.get("scriptNote"),
    footerLine: formData.get("footerLine"),
    currency: "USD",
    copPerUsd: parseTurkishRate(String(formData.get("copPerUsd") ?? "")),
    hnlPerUsd: parseTurkishRate(String(formData.get("hnlPerUsd") ?? "")),
    bankName: formData.get("bankName"),
    accountHolder: formData.get("accountHolder"),
    accountNumber: formData.get("accountNumber"),
    bankNote: formData.get("bankNote"),
    thanksMessage: formData.get("thanksMessage"),
  });
  if (!parsed.success) redirect("/admin/ajustes?error=1");
  // Las columnas de correo siguen siendo NOT NULL en la base de datos,
  // por lo que conservamos los valores actuales en lugar de escribirlos.
  const current = await getSettings();
  const settings: Settings = {
    ...parsed.data,
    notifyEmail: current.notifyEmail,
    guestTemplate: current.guestTemplate,
    ownerTemplate: current.ownerTemplate,
  };
  await saveSettings(settings);
  revalidatePath("/");
  revalidatePath("/admin/ajustes");
  redirect("/admin/ajustes?ok=1");
}

export async function releaseGift(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/regalos");
  await releaseOrder(id);
  revalidatePath("/");
  revalidatePath("/admin/regalos");
  revalidatePath("/admin/productos");
  redirect("/admin/regalos");
}

export async function setGiftStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (status !== "pendiente" && status !== "recibido") return;
  await setOrderStatus(id, status as OrderStatus);
  revalidatePath("/admin/regalos");
  revalidatePath(`/admin/regalos/${id}`);
}
