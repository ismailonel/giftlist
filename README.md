# GiftList

Bebek hediye listesi. Sitede üyelik ve ödeme yok: hediye eden kişi bir bolsa de regalo oluşturur, mesaj bırakır ve toplam tutarı e-postadaki hesaba gönderir.

`DATABASE_URL` yokken veriler bu bilgisayarda `.data/store.json` dosyasında durur. Vercel'de kalıcı olması için Supabase Postgres gerekir. `db.<proje>.supabase.co` (port 5432 veya 6543) IPv6'dır; Vercel onu çözemez. Panelde bu, dedicated pooler olarak da görünür. IPv4 adresi **shared pooler**'dır: host `aws-….pooler.supabase.com`, kullanıcı `postgres.<proje>`, transaction için port `6543`.

## Yerelde

```bash
npm install
npm run dev
```

`ADMIN_PASSWORD` tanımlı değilse geliştirme anahtarı `regalos`.

## Vercel

1. Supabase → Connect → **Shared pooler / Transaction** URI'sini `DATABASE_URL` olarak ekle. Host `pooler.supabase.com` olmalı. `db.<proje>.supabase.co` kullanma.
2. `ADMIN_PASSWORD` ve uzun bir `SESSION_SECRET` tanımla.
3. [Resend](https://resend.com) için `RESEND_API_KEY` ve `EMAIL_FROM`.
4. Fotoğraflar için bir Blob deposu açıp `BLOB_READ_WRITE_TOKEN` ekle.
5. Ajustes ekranından bildirim e-postasını, banka bilgilerini ve şablonları doldur.

Tablolar ilk açılışta oluşur. İstersen `npm run db:push` ile Drizzle şemasını da eşitleyebilirsin.
