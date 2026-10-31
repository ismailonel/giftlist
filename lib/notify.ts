import "server-only";

import { Resend } from "resend";
import { formatMoney } from "./format";
import type { Order, Settings } from "./types";

export async function notifyOwner(order: Order, settings: Settings) {
  const key = process.env.RESEND_API_KEY?.trim();
  const to = settings.notifyEmail.trim();
  if (!key || !to) return;
  try {
    const resend = new Resend(key);
    const items = order.items
      .map((item) => `• ${item.quantity} × ${item.name} (${formatMoney(item.priceCents * item.quantity, "USD")})`)
      .join("\n");
    const total = formatMoney(order.totalCents, "USD");
    const { error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM?.trim() ||
        "GiftList <onboarding@resend.dev>",
      to,
      subject: `Nuevo regalo apartado · ${order.code}`,
      text: [
        `${order.guestName} apartó los siguientes regalos:`,
        "",
        items,
        "",
        `Total: ${total}`,
        `Referencia: ${order.code}`,
        "",
        order.message ? `Mensaje:\n${order.message}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
    if (error) console.error("notifyOwner resend error", error);
  } catch (error) {
    console.error("notifyOwner failed", error);
  }
}
