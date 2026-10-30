import { Suspense } from "react";
import Link from "next/link";
import { logout } from "@/app/actions";

export const instant = false;

export const metadata = {
  robots: { index: false, follow: false },
  title: "Admin · Lista de regalos",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-full max-w-5xl px-4 py-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="font-serif text-2xl">
          Lista de regalos
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/admin/productos">Productos</Link>
          <Link href="/admin/regalos">Regalos</Link>
          <Link href="/admin/ajustes">Ajustes</Link>
          <form action={logout}>
            <button type="submit" className="text-[#6f675f]">
              Salir
            </button>
          </form>
        </nav>
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-[#e7e0d4]" />}>
        {children}
      </Suspense>
    </div>
  );
}
