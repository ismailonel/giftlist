import "server-only";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

const types: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function storeImage(bytes: Uint8Array, contentType: string) {
  const extension = types[contentType];
  if (!extension) {
    throw new Error("Usa una imagen JPG, PNG o WebP.");
  }
  if (bytes.byteLength > 6_000_000) {
    throw new Error("La imagen pesa más de 6 MB.");
  }

  const filename = `products/${randomUUID()}.${extension}`;
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (token) {
    const blob = await put(filename, Buffer.from(bytes), {
      access: "public",
      contentType,
      token,
    });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Para guardar imágenes en Vercel hace falta BLOB_READ_WRITE_TOKEN.",
    );
  }

  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  const base = filename.split("/")[1];
  await writeFile(path.join(directory, base), bytes);
  return `/uploads/${base}`;
}
