import { notFound } from "next/navigation";
import { releaseGift, setGiftStatus } from "@/app/actions";
import { requireAdmin } from "@/lib/auth";
import { formatMoney, formatWhen } from "@/lib/format";
import { getOrder } from "@/lib/store";

export const instant = false;

export default async function GiftPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

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
            {item.quantity} × {item.name} — {formatMoney(item.priceCents * item.quantity, "USD")}
          </li>
        ))}
      </ul>
      <p className="font-serif text-3xl">{formatMoney(order.totalCents, "USD")}</p>
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
      <form action={releaseGift}>
        <input type="hidden" name="id" value={order.id} />
        <button className="rounded-full border border-[#8a4b3a] px-4 py-2 text-sm text-[#8a4b3a]">
          Devolver a la lista
        </button>
        <p className="mt-2 text-xs text-[#8a8178]">
          El stock de estos regalos vuelve a la lista y esta reserva se elimina.
        </p>
      </form>
    </div>
  );
}
