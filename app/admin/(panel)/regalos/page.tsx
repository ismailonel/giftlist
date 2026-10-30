import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatMoney, formatWhen } from "@/lib/format";
import { getSettings, listOrders } from "@/lib/store";

export const instant = false;

export default async function GiftsPage() {
  await requireAdmin();
  const [orders, settings] = await Promise.all([listOrders(), getSettings()]);

  return (
    <div>
      <h1 className="font-serif text-4xl">Regalos</h1>
      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-[#6f675f]">Todavía no hay regalos apartados.</p>
      ) : (
        <ul className="mt-6 divide-y divide-[#e4dcd0] rounded-2xl border border-[#e4dcd0]">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/admin/regalos/${order.id}`} className="block px-4 py-3">
                <span className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm">{order.guestName}</span>
                  <span className="font-serif text-xl">{formatMoney(order.totalCents, settings.currency)}</span>
                </span>
                <span className="mt-1 block text-xs text-[#8a8178]">
                  {formatWhen(order.createdAt)} · {order.status === "recibido" ? "Recibido" : "Pendiente"} · {order.code}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
