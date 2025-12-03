# Perbaikan Sistem Notifikasi - Summary

## Masalah yang Diperbaiki

### 1. ✅ NotificationBell Muncul di Semua Halaman
**Masalah:** NotificationBell muncul di semua halaman, bukan hanya di admin.

**Solusi:**
- Menambahkan prop `isAdmin` ke `NotificationBell.astro`
- Menambahkan logika di `Header.astro` untuk detect halaman admin
- NotificationBell sekarang hanya render jika `isAdmin={true}`

**File yang diubah:**
- `src/components/NotificationBell.astro` - Added isAdmin prop check
- `src/components/Header.astro` - Added admin page detection

### 2. ✅ Integrasi dengan Supabase
**Masalah:** Notifikasi belum terintegrasi dengan tabel `article_likes` dan `article_comments` di Supabase.

**Solusi:**
- Membuat SQL triggers yang otomatis membuat notifikasi ketika ada like/comment baru
- Triggers berjalan di server Supabase, tidak perlu client-side logic
- Notifikasi langsung masuk ke tabel `notifications`

**File yang dibuat:**
- `supabase_setup_complete.sql` - Setup lengkap semua tabel dan triggers
- `supabase_engagement_tables.sql` - Tabel article_likes & article_comments
- `supabase_triggers.sql` - Triggers untuk auto-notification
- `supabase_notifications.sql` - Tabel notifications (sudah ada sebelumnya)

**File yang diubah:**
- `src/pages/api/admin/notifications.ts` - Added PATCH endpoint for updating read status

## Cara Setup

### Quick Setup (5 Menit)

1. **Jalankan SQL di Supabase**
   ```bash
   # Buka Supabase SQL Editor
   # Copy-paste isi file: supabase_setup_complete.sql
   # Klik "Run"
   ```

2. **Pastikan Environment Variables**
   ```env
   PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

3. **Test**
   - Buka `/admin/dashboard`
   - NotificationBell harus muncul di header (icon bell)
   - Buka artikel di tab baru
   - Like atau comment artikel
   - Kembali ke dashboard
   - Notifikasi harus muncul dengan badge merah!

## Cara Kerja Sistem

### Flow Notifikasi

```
User Like/Comment Artikel
    ↓
FloatingReactions.astro mengirim ke Supabase
    ↓
Data masuk ke article_likes / article_comments
    ↓
Trigger Supabase otomatis jalan
    ↓
Function notify_new_like() / notify_new_comment()
    ↓
Insert ke tabel notifications
    ↓
NotificationBell.astro polling setiap 10 detik
    ↓
API /api/admin/notifications ambil data
    ↓
Notifikasi tampil di UI dengan badge
```

### Komponen Sistem

1. **Frontend (Client-Side)**
   - `NotificationBell.astro` - UI komponen (hanya di admin pages)
   - `FloatingReactions.astro` - Like & comment UI
   - `admin-notifications-client.ts` - Helper untuk kirim notifikasi

2. **Backend (Server-Side)**
   - `api/admin/notifications.ts` - API endpoint (GET, POST, PATCH, DELETE)
   - `notifications.ts` - Core library (localStorage + Supabase)

3. **Database (Supabase)**
   - `article_likes` - Tabel untuk likes
   - `article_comments` - Tabel untuk comments
   - `notifications` - Tabel untuk notifikasi
   - Triggers - Auto-create notifications

## File Dokumentasi

- `NOTIFICATION_QUICKSTART.md` - Panduan cepat setup
- `NOTIFICATION_SETUP.md` - Dokumentasi lengkap dengan troubleshooting
- `CHANGELOG_NOTIFICATIONS.md` - File ini (summary perubahan)

## Testing

### Test Manual

1. **Test NotificationBell hanya muncul di admin:**
   ```
   ✓ Buka /admin/dashboard → Bell harus muncul
   ✓ Buka /blog → Bell TIDAK muncul
   ✓ Buka / → Bell TIDAK muncul
   ```

2. **Test Notifikasi Like:**
   ```
   1. Buka /admin/dashboard di tab 1
   2. Buka artikel di tab 2
   3. Klik like button
   4. Kembali ke tab 1
   5. Badge merah harus muncul di bell icon
   6. Klik bell → notifikasi like harus ada
   ```

3. **Test Notifikasi Comment:**
   ```
   1. Buka /admin/dashboard di tab 1
   2. Buka artikel di tab 2
   3. Submit comment
   4. Kembali ke tab 1
   5. Badge merah harus muncul
   6. Klik bell → notifikasi comment harus ada
   ```

### Test dengan SQL

```sql
-- Test insert like (akan trigger notifikasi)
INSERT INTO article_likes (slug, user_hash)
VALUES ('test-article', 'test-user-123');

-- Test insert comment (akan trigger notifikasi)
INSERT INTO article_comments (slug, name, message, status)
VALUES ('test-article', 'Test User', 'Komentar test!', 'published');

-- Cek notifikasi yang dibuat
SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 5;
```

## Troubleshooting

### Notifikasi tidak muncul
1. Cek console browser untuk error
2. Cek Supabase credentials di .env
3. Cek tabel notifications ada data: `SELECT * FROM notifications;`
4. Cek triggers aktif di Supabase

### NotificationBell masih muncul di semua halaman
- Clear browser cache
- Restart dev server
- Cek `Header.astro` line 8-9 ada logika `isAdminPage`

### Trigger tidak jalan
```sql
-- Verifikasi triggers
SELECT * FROM information_schema.triggers
WHERE event_object_table IN ('article_likes', 'article_comments');

-- Jika kosong, jalankan ulang supabase_triggers.sql
```

## Fitur Tambahan (Optional)

### Real-time Notifications
Untuk notifikasi real-time tanpa polling, uncomment code di `NotificationBell.astro`:

```javascript
// Setup Supabase Realtime subscription
const channel = client
    .channel('notifications')
    .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
    }, (payload) => {
        this.loadAndDisplay();
    })
    .subscribe();
```

### Telegram Integration
Notifikasi like dan comment juga dikirim ke Telegram jika configured:

```env
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

## Struktur Database

### notifications
- `id` (UUID) - Primary key
- `type` (TEXT) - 'newsletter', 'like', 'comment', 'bookmark'
- `title` (TEXT) - Judul notifikasi
- `message` (TEXT) - Pesan notifikasi
- `metadata` (JSONB) - Data tambahan
- `timestamp` (TIMESTAMPTZ) - Waktu dibuat
- `read` (BOOLEAN) - Status baca

### article_likes
- `id` (UUID) - Primary key
- `slug` (TEXT) - Slug artikel
- `user_hash` (TEXT) - Hash user
- `created_at` (TIMESTAMPTZ) - Waktu dibuat

### article_comments
- `id` (UUID) - Primary key
- `slug` (TEXT) - Slug artikel
- `name` (TEXT) - Nama komentator
- `message` (TEXT) - Isi komentar
- `status` (TEXT) - 'published', 'pending', 'spam'
- `created_at` (TIMESTAMPTZ) - Waktu dibuat

## API Endpoints

### GET /api/admin/notifications
Ambil semua notifikasi

**Query params:**
- `since` - Timestamp untuk filter notifikasi baru
- `type` - Filter by type (newsletter, like, comment, bookmark)
- `unread` - true untuk hanya unread

**Response:**
```json
{
  "success": true,
  "notifications": [...],
  "unreadCount": 5
}
```

### POST /api/admin/notifications
Buat notifikasi baru

**Body:**
```json
{
  "type": "like",
  "metadata": {
    "articleSlug": "my-article",
    "articleTitle": "My Article"
  }
}
```

### PATCH /api/admin/notifications?id={id}
Mark notifikasi sebagai read

### PATCH /api/admin/notifications?markAllRead=true
Mark semua notifikasi sebagai read

### DELETE /api/admin/notifications?id={id}
Hapus notifikasi tertentu

### DELETE /api/admin/notifications
Hapus semua notifikasi

---

## Kesimpulan

✅ NotificationBell sekarang hanya muncul di halaman admin
✅ Terintegrasi penuh dengan Supabase (article_likes, article_comments)
✅ Auto-notification via triggers
✅ Polling setiap 10 detik untuk update
✅ Support mark as read, delete, clear all
✅ Dokumentasi lengkap tersedia

**Next Steps:**
1. Jalankan `supabase_setup_complete.sql` di Supabase
2. Test notifikasi dengan like/comment artikel
3. (Optional) Setup Telegram integration
4. (Optional) Enable Supabase Realtime untuk instant notifications

**Support:**
- Lihat `NOTIFICATION_SETUP.md` untuk troubleshooting detail
- Lihat `NOTIFICATION_QUICKSTART.md` untuk quick reference
