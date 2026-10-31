import { saveSettingsAction } from "@/app/actions";
import { requireAdmin } from "@/lib/auth";
import { formatTurkishRate } from "@/lib/format";
import { getSettings } from "@/lib/store";

export const instant = false;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  await requireAdmin();
  const [{ error, ok }, settings] = await Promise.all([searchParams, getSettings()]);

  return (
    <form action={saveSettingsAction} className="space-y-6">
      <h1 className="font-serif text-4xl">Ajustes</h1>
      {ok ? <p className="text-sm text-[#6f675f]">Guardado.</p> : null}
      {error ? <p className="text-sm text-[#8a4b3a]">Revisa los campos.</p> : null}
      <section className="grid gap-4 rounded-2xl border border-[#e4dcd0] p-4 sm:grid-cols-2">
        <Field name="monogram" label="Monograma" defaultValue={settings.monogram} />
        <Field name="siteName" label="Nombre del sitio" defaultValue={settings.siteName} />
        <Field name="title" label="Título" defaultValue={settings.title} className="sm:col-span-2" />
        <Field name="subtitle" label="Subtítulo" defaultValue={settings.subtitle} className="sm:col-span-2" />
        <Area name="scriptNote" label="Nota manuscrita" defaultValue={settings.scriptNote} />
        <Field name="footerLine" label="Línea del pie" defaultValue={settings.footerLine} />
      </section>
      <section className="grid gap-4 rounded-2xl border border-[#e4dcd0] p-4 sm:grid-cols-2">
        <h2 className="font-serif text-2xl sm:col-span-2">Tipo de cambio</h2>
        <p className="text-sm text-[#6f675f] sm:col-span-2">
          Los regalos se cargan en USD. En la lista se ven en COP o HNL. Escribe los decimales con coma: 4.150,50
        </p>
        <Field name="copPerUsd" label="1 USD en COP" defaultValue={formatTurkishRate(settings.copPerUsd)} />
        <Field name="hnlPerUsd" label="1 USD en HNL" defaultValue={formatTurkishRate(settings.hnlPerUsd)} />
      </section>
      <section className="grid gap-4 rounded-2xl border border-[#e4dcd0] p-4 sm:grid-cols-2">
        <h2 className="font-serif text-2xl sm:col-span-2">Transferencia</h2>
        <Field name="bankName" label="Banco" defaultValue={settings.bankName} />
        <Field name="accountHolder" label="Titular" defaultValue={settings.accountHolder} />
        <Field name="accountNumber" label="Cuenta o IBAN" defaultValue={settings.accountNumber} className="sm:col-span-2" />
        <Area name="bankNote" label="Nota" defaultValue={settings.bankNote} />
      </section>
      <section className="space-y-4 rounded-2xl border border-[#e4dcd0] p-4">
        <h2 className="font-serif text-2xl">Página de agradecimiento</h2>
        <Field name="thanksMessage" label="Mensaje (después del nombre)" defaultValue={settings.thanksMessage} />
      </section>
      <button className="rounded-full bg-[#3f3a34] px-5 py-2 text-sm text-[#f7f3ec]">Guardar</button>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  className = "",
}: {
  name: string;
  label: string;
  defaultValue: string;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      {label}
      <input name={name} type={type} defaultValue={defaultValue} className="mt-1 w-full rounded-xl border border-[#e4dcd0] bg-white/70 px-3 py-2" />
    </label>
  );
}

function Area({
  name,
  label,
  defaultValue,
  rows = 4,
}: {
  name: string;
  label: string;
  defaultValue: string;
  rows?: number;
}) {
  return (
    <label className="block text-sm sm:col-span-2">
      {label}
      <textarea name={name} rows={rows} defaultValue={defaultValue} className="mt-1 w-full rounded-xl border border-[#e4dcd0] bg-white/70 px-3 py-2" />
    </label>
  );
}
