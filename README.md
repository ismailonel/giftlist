# GiftList

Bebek hediye listesi. Sitede üyelik ve ödeme yok: hediye eden kişi bir bolsa de regalo oluşturur, mesaj bırakır ve toplam tutarı e-postadaki hesaba gönderir.

`DATABASE_URL` yokken veriler bu bilgisayarda `.data/store.json` dosyasında durur. Vercel doğrudan Postgres adresine bağlanamaz: `db.<proje>.supabase.co` IPv6'dır. Üretimde veri Supabase Data API üzerinden gider. Bunun için `SUPABASE_URL` (`https://<proje>.supabase.co`) ve `SUPABASE_SERVICE_ROLE_KEY` gerekir. `DATABASE_URL` tanımlı olsa bile bu ikisi varsa kullanılmaz.

## Yerelde

```bash
npm install
npm run dev
```

`ADMIN_PASSWORD` tanımlı değilse geliştirme anahtarı `regalos`.

## Vercel

1. Supabase → Project Settings → Data API: API açık olsun ve Exposed schemas listesinde `public` olsun. Sonra Project URL'yi `SUPABASE_URL`, service role anahtarını `SUPABASE_SERVICE_ROLE_KEY` olarak Vercel'e ekle.
2. `ADMIN_PASSWORD` ve uzun bir `SESSION_SECRET` tanımla.
3. [Resend](https://resend.com) için `RESEND_API_KEY` ve `EMAIL_FROM`.
4. Fotoğraflar için bir Blob deposu açıp `BLOB_READ_WRITE_TOKEN` ekle.
5. Ajustes ekranından bildirim e-postasını, banka bilgilerini ve şablonları doldur.

Tablolar ilk açılışta oluşur. İstersen `npm run db:push` ile Drizzle şemasını da eşitleyebilirsin.
