import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  giftlistSql?: ReturnType<typeof postgres>;
  giftlistReady?: Promise<void>;
};

export function databaseUrl() {
  return process.env.DATABASE_URL?.trim() || "";
}

export function hasDatabase() {
  return databaseUrl().length > 0;
}

export function getSql() {
  const url = databaseUrl();
  if (!url) return null;
  if (!globalForDb.giftlistSql) {
    const local = /localhost|127\.0\.0\.1/.test(url);
    globalForDb.giftlistSql = postgres(url, {
      ssl: local ? false : "require",
      max: 1,
    });
  }
  return globalForDb.giftlistSql;
}

export function getDb() {
  const sql = getSql();
  if (!sql) return null;
  return drizzle(sql, { schema });
}

export async function ensureDatabase() {
  const sql = getSql();
  if (!sql) return;
  if (!globalForDb.giftlistReady) {
    globalForDb.giftlistReady = createTables(sql).catch((error) => {
      globalForDb.giftlistReady = undefined;
      throw error;
    });
  }
  await globalForDb.giftlistReady;
}

async function createTables(sql: ReturnType<typeof postgres>) {
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id text PRIMARY KEY,
      monogram text NOT NULL,
      site_name text NOT NULL,
      title text NOT NULL,
      subtitle text NOT NULL,
      script_note text NOT NULL,
      footer_line text NOT NULL,
      currency text NOT NULL,
      notify_email text NOT NULL,
      bank_name text NOT NULL,
      account_holder text NOT NULL,
      account_number text NOT NULL,
      bank_note text NOT NULL,
      guest_template text NOT NULL,
      owner_template text NOT NULL,
      thanks_message text NOT NULL
    )`;
  await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS thanks_message text NOT NULL DEFAULT ''`;
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id text PRIMARY KEY,
      name text NOT NULL,
      sort integer NOT NULL,
      span text NOT NULL
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id text PRIMARY KEY,
      category_id text NOT NULL,
      name text NOT NULL,
      price_cents integer NOT NULL,
      stock integer NOT NULL,
      image_url text NOT NULL,
      amazon_url text NOT NULL,
      published boolean NOT NULL,
      sort integer NOT NULL
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id text PRIMARY KEY,
      code text NOT NULL UNIQUE,
      guest_name text NOT NULL,
      guest_email text NOT NULL,
      message text NOT NULL,
      total_cents integer NOT NULL,
      status text NOT NULL,
      guest_email_sent boolean NOT NULL,
      owner_email_sent boolean NOT NULL,
      email_note text NOT NULL,
      created_at timestamptz NOT NULL
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id text PRIMARY KEY,
      order_id text NOT NULL,
      product_id text NOT NULL,
      name text NOT NULL,
      quantity integer NOT NULL,
      price_cents integer NOT NULL
    )`;
}
