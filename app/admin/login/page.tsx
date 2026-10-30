import { login } from "@/app/actions";
import { devLoginHint } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-full max-w-sm flex-col justify-center px-5 py-16">
      <h1 className="text-center font-serif text-4xl">Entrar</h1>
      <form action={login} className="mt-8 space-y-4">
        <label className="block text-sm">
          Clave
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-xl border border-[#e4dcd0] bg-white/70 px-3 py-2"
          />
        </label>
        {error === "1" ? <p className="text-sm text-[#8a4b3a]">La clave no coincide.</p> : null}
        {error === "config" ? (
          <p className="text-sm text-[#8a4b3a]">Falta ADMIN_PASSWORD o SESSION_SECRET.</p>
        ) : null}
        {devLoginHint() ? (
          <p className="text-xs text-[#6f675f]">En desarrollo, la clave es regalos.</p>
        ) : null}
        <button type="submit" className="w-full rounded-full bg-[#3f3a34] px-4 py-3 text-sm text-[#f7f3ec]">
          Entrar
        </button>
      </form>
    </main>
  );
}
