import "server-only";

import { Resend } from "resend";
import { formatMoney } from "./format";
import type { Order, Settings } from "./types";

export function renderTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => vars[key] ?? "");
}

export function emailVars(order: Order, settings: Settings) {
  const items = order.items
    .map(
      (item) =>
        `• ${item.quantity} × ${item.name} — ${formatMoney(item.priceCents * item.quantity, settings.currency)}`,
    )
    .join("\n");

  return {
    nombre: order.guestName,
    correo: order.guestEmail,
    items,
    total: formatMoney(order.totalCents, settings.currency),
    mensaje: order.message.trim() || "(sin mensaje)",
    iban: settings.accountNumber || "(complétalo en Ajustes)",
    banco: settings.bankName || "(complétalo en Ajustes)",
    titular: settings.accountHolder || "(complétalo en Ajustes)",
    codigo: order.code,
    nota: settings.bankNote,
  };
}

export function buildEmails(order: Order, settings: Settings) {
  const vars = emailVars(order, settings);
  return {
    guest: {
      subject: "Gracias por tu regalo",
      text: renderTemplate(settings.guestTemplate, vars),
    },
    owner: {
      subject: `Nuevo regalo de ${order.guestName}`,
      text: renderTemplate(settings.ownerTemplate, vars),
    },
  };
}

export async function deliverEmails(order: Order, settings: Settings) {
  const messages = buildEmails(order, settings);
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  let guestEmailSent = false;
  let ownerEmailSent = false;
  const notes: string[] = [];

  if (!apiKey || !from) {
    notes.push("Falta RESEND_API_KEY o EMAIL_FROM. El regalo quedó guardado.");
    return { guestEmailSent, ownerEmailSent, emailNote: notes.join(" ") };
  }

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from,
      to: order.guestEmail,
      subject: messages.guest.subject,
      text: messages.guest.text,
    });
    guestEmailSent = true;
  } catch (error) {
    notes.push(`No se envió el correo a quien regala: ${messageOf(error)}`);
  }

  if (!settings.notifyEmail.trim()) {
    notes.push("Falta el correo de aviso en Ajustes.");
  } else {
    try {
      await resend.emails.send({
        from,
        to: settings.notifyEmail.trim(),
        subject: messages.owner.subject,
        text: messages.owner.text,
      });
      ownerEmailSent = true;
    } catch (error) {
      notes.push(`No se envió el aviso: ${messageOf(error)}`);
    }
  }

  return { guestEmailSent, ownerEmailSent, emailNote: notes.join(" ") };
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "error desconocido";
}
