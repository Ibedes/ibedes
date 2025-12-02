# Setup Notifikasi - Quick Start

## Langkah Setup (5 Menit)

### 1. Setup Tabel Supabase

Jalankan SQL berikut **secara berurutan** di Supabase SQL Editor:

```bash
# 1. Buat tabel engagement (likes & comments)
supabase_engagement_tables.sql

# 2. Buat tabel notifications
supabase_notifications.sql

# 3. Buat triggers untuk auto-notification
supabase_triggers.sql
```

### 2. Konfigurasi Environment

Tambahkan ke `.env`:

```env
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 3. Test

1. Buka `/admin/dashboard` - NotificationBell harus muncul di header
2. Buka artikel di tab baru
3. Like atau comment artikel
4. Kembali ke dashboard - notifikasi harus muncul!

## Troubleshooting Cepat

**Notifikasi tidak muncul?**
- Cek console browser untuk error
- Pastikan env variables sudah benar
- Cek tabel notifications di Supabase

**NotificationBell muncul di semua halaman?**
- Sudah diperbaiki! Sekarang hanya muncul di `/admin/*`

**Trigger tidak jalan?**
- Verifikasi triggers aktif:
  ```sql
  SELECT * FROM information_schema.triggers
  WHERE event_object_table IN ('article_likes', 'article_comments');
  ```

## File Penting

- `src/components/NotificationBell.astro` - UI komponen
- `src/lib/notifications.ts` - Core logic
- `src/pages/api/admin/notifications.ts` - API endpoint
- `NOTIFICATION_SETUP.md` - Dokumentasi lengkap

---

**Sudah berfungsi?** Lihat `NOTIFICATION_SETUP.md` untuk fitur advanced!
