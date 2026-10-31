import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  id: text("id").primaryKey(),
  monogram: text("monogram").notNull(),
  siteName: text("site_name").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  scriptNote: text("script_note").notNull(),
  footerLine: text("footer_line").notNull(),
  currency: text("currency").notNull(),
  copPerUsd: text("cop_per_usd").notNull(),
  hnlPerUsd: text("hnl_per_usd").notNull(),
  notifyEmail: text("notify_email").notNull(),
  bankName: text("bank_name").notNull(),
  accountHolder: text("account_holder").notNull(),
  accountNumber: text("account_number").notNull(),
  bankNote: text("bank_note").notNull(),
  guestTemplate: text("guest_template").notNull(),
  ownerTemplate: text("owner_template").notNull(),
  thanksMessage: text("thanks_message").notNull(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  sort: integer("sort").notNull(),
  span: text("span").notNull(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").notNull(),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull(),
  stock: integer("stock").notNull(),
  imageUrl: text("image_url").notNull(),
  amazonUrl: text("amazon_url").notNull(),
  published: boolean("published").notNull(),
  sort: integer("sort").notNull(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  message: text("message").notNull(),
  totalCents: integer("total_cents").notNull(),
  status: text("status").notNull(),
  guestEmailSent: boolean("guest_email_sent").notNull(),
  ownerEmailSent: boolean("owner_email_sent").notNull(),
  emailNote: text("email_note").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  priceCents: integer("price_cents").notNull(),
});
