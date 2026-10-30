import { notFound } from "next/navigation";
import { resendGiftEmails, setGiftStatus } from "@/app/actions";
import { requireAdmin } from "@/lib/auth";
import { buildEmails } from "@/lib/email";
import { formatMoney, formatWhen } from "@/lib/format";
import { getOrder, getSettings } from "@/lib/store";

export const instant = false;

export default async function GiftPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [order, settings] = await Promise.all([getOrder(id), getSettings()]);
  if (!order) notFound();
  const emails = buildEmails(order, settings);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] tracking-[0.22em] uppercase">{order.code}</p>
        <h1 className="font-serif text-4xl">{order.guestName}</h1>
        <p className="text-sm text-[#6f675f]">
          {order.guestEmail ? `${order.guestEmail} · ` : ""}
          {formatWhen(order.createdAt)}
        </p>
      </div>
      <ul className="space-y-1 text-sm">
        {order.items.map((item) => (
          <li key={item.id}>
            {item.quantity} × {item.name} — {formatMoney(item.priceCents * item.quantity, settings.currency)}
          </li>
        ))}
      </ul>
      <p className="font-serif text-3xl">{formatMoney(order.totalCents, settings.currency)}</p>
      <section className="rounded-2xl border border-[#e4dcd0] p-4">
        <h2 className="text-[11px] tracking-[0.22em] uppercase">Mensaje</h2>
        <p className="mt-2 text-sm whitespace-pre-wrap">{order.message || "(sin mensaje)"}</p>
      </section>
      <form action={setGiftStatus} className="flex items-center gap-3">
        <input type="hidden" name="id" value={order.id} />
        <label className="text-sm">
          Estado
          <select name="status" defaultValue={order.status} className="mt-1 block rounded-xl border border-[#e4dcd0] bg-white/70 px-3 py-2">
            <option value="pendiente">Pendiente</option>
            <option value="recibido">Recibido</option>
          </select>
        </label>
        <button className="mt-5 rounded-full border border-[#3f3a34] px-4 py-2 text-sm">Guardar</button>
      </form>
      {order.emailNote ? <p className="text-sm text-[#8a4b3a]">{order.emailNote}</p> : null}
      <p className="text-xs text-[#8a8178]">
        Correo a quien regala: {order.guestEmailSent ? "enviado" : "pendiente"}. Aviso: {order.ownerEmailSent ? "enviado" : "pendiente"}.
      </p>
      <form action={resendGiftEmails}>
        <input type="hidden" name="id" value={order.id} />
        <button className="rounded-full bg-[#3f3a34] px-4 py-2 text-sm text-[#f7f3ec]">Reenviar correos</button>
      </form>
      <details className="rounded-2xl border border-[#e4dcd0] p-4 text-sm">
        <summary>Vista previa de los correos</summary>
        <h2 className="mt-4 font-medium">{emails.guest.subject}</h2>
        <pre className="mt-2 whitespace-pre-wrap font-sans">{emails.guest.text}</pre>
        <h2 className="mt-6 font-medium">{emails.owner.subject}</h2>
        <pre className="mt-2 whitespace-pre-wrap font-sans">{emails.owner.text}</pre>
      </details>
    </div>
  );
}
