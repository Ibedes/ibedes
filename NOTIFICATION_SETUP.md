# Setup Notifikasi Supabase

Panduan untuk mengintegrasikan sistem notifikasi dengan Supabase.

## 1. Persiapan Tabel di Supabase

### Jalankan SQL untuk membuat tabel notifications

Buka **Supabase SQL Editor** dan jalankan file `supabase_notifications.sql`:

```sql
-- Lihat file: supabase_notifications.sql
```

Tabel ini akan menyimpan semua notifikasi admin (newsletter, likes, comments, bookmarks).

### Jalankan SQL untuk membuat triggers

Buka **Supabase SQL Editor** dan jalankan file `supabase_triggers.sql`:

```sql
-- Lihat file: supabase_triggers.sql
```

Triggers ini akan otomatis membuat notifikasi ketika:
- Ada like baru di tabel `article_likes`
- Ada komentar baru di tabel `article_comments`

## 2. Konfigurasi Environment Variables

Pastikan file `.env` memiliki konfigurasi berikut:

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Untuk server-side operations (API routes)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Telegram notifications
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

## 3. Cara Kerja Sistem

### Flow Notifikasi

1. **User melakukan aksi** (like/comment artikel)
   - FloatingReactions.astro mengirim data ke Supabase
   - Data masuk ke tabel `article_likes` atau `article_comments`

2. **Trigger Supabase otomatis berjalan**
   - Function `notify_new_like()` atau `notify_new_comment()` dipanggil
   - Notifikasi baru dibuat di tabel `notifications`

3. **Admin melihat notifikasi**
   - NotificationBell.astro polling setiap 10 detik
   - Mengambil data dari `/api/admin/notifications`
   - API membaca dari tabel `notifications` di Supabase

### Komponen Utama

- **NotificationBell.astro** - UI komponen notifikasi (hanya muncul di halaman admin)
- **notifications.ts** - Library untuk manage notifikasi (localStorage + Supabase)
- **admin-notifications-client.ts** - Helper untuk mengirim notifikasi dari client-side
- **api/admin/notifications.ts** - API endpoint untuk CRUD notifikasi

## 4. Testing

### Test Manual

1. **Buka halaman admin**: `/admin/dashboard`
2. **Buka artikel di tab lain**: `/blog/artikel-anda`
3. **Like atau comment artikel tersebut**
4. **Kembali ke dashboard admin**
5. **Notifikasi bell harus menampilkan badge merah dengan jumlah notifikasi**

### Test dengan SQL

Tambahkan notifikasi manual untuk testing:

```sql
INSERT INTO notifications (type, title, message, metadata, read)
VALUES (
    'like',
    '❤️ Like Baru',
    'Artikel "Test Article" mendapat like',
    '{"articleSlug": "test-article", "articleTitle": "Test Article", "userHash": "test-user"}',
    false
);
```

## 5. Troubleshooting

### Notifikasi tidak muncul

1. **Cek Supabase connection**
   ```javascript
   // Di browser console
   console.log(import.meta.env.PUBLIC_SUPABASE_URL);
   console.log(import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
   ```

2. **Cek triggers aktif**
   ```sql
   SELECT * FROM information_schema.triggers
   WHERE trigger_schema = 'public'
   AND event_object_table IN ('article_likes', 'article_comments');
   ```

3. **Cek data di tabel notifications**
   ```sql
   SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 10;
   ```

### Notifikasi muncul di semua halaman

- Pastikan NotificationBell hanya menerima `isAdmin={true}` di halaman admin
- Cek implementasi di `Header.astro`:
  ```astro
  const isAdminPage = currentPath.startsWith('/admin');
  <NotificationBell isAdmin={isAdminPage} />
  ```

### Polling terlalu sering

Edit interval di `NotificationBell.astro`:

```javascript
// Line ~174
this.checkInterval = window.setInterval(async () => {
    await this.loadAndDisplay();
}, 30000); // Ubah dari 10000 (10s) ke 30000 (30s)
```

## 6. Fitur Tambahan

### Real-time dengan Supabase Realtime

Untuk notifikasi real-time tanpa polling, tambahkan subscription:

```javascript
const client = await loadSupabaseClient();
const channel = client
    .channel('notifications')
    .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
    }, (payload) => {
        // Update UI dengan notifikasi baru
        this.loadAndDisplay();
    })
    .subscribe();
```

### Integrasi dengan Telegram

Notifikasi like dan comment otomatis dikirim ke Telegram jika configured.
Lihat `admin-notifications-client.ts` line 131-200.

## 7. Struktur Database

### Tabel: notifications

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| type | TEXT | 'newsletter', 'like', 'comment', 'bookmark' |
| title | TEXT | Judul notifikasi |
| message | TEXT | Pesan notifikasi |
| metadata | JSONB | Data tambahan (articleSlug, userHash, dll) |
| timestamp | TIMESTAMPTZ | Waktu notifikasi dibuat |
| read | BOOLEAN | Status sudah dibaca atau belum |

### Tabel: article_likes

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| slug | TEXT | Slug artikel |
| user_hash | TEXT | Hash user yang like |
| created_at | TIMESTAMPTZ | Waktu like dibuat |

### Tabel: article_comments

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| slug | TEXT | Slug artikel |
| name | TEXT | Nama komentator |
| message | TEXT | Isi komentar |
| status | TEXT | 'published', 'pending', 'spam' |
| created_at | TIMESTAMPTZ | Waktu komentar dibuat |

---

**Catatan**: Pastikan RLS (Row Level Security) policies sudah dikonfigurasi dengan benar di Supabase untuk keamanan data.
