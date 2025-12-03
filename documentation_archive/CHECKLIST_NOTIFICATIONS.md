# ✅ Checklist Setup Notifikasi

Gunakan checklist ini untuk memastikan semua langkah setup sudah dilakukan dengan benar.

## 📋 Pre-Setup

- [ ] Akses ke Supabase Dashboard
- [ ] Project Supabase sudah dibuat
- [ ] File `.env` sudah ada di root project

## 🗄️ Database Setup

### Step 1: Setup Tabel di Supabase

- [ ] Buka Supabase SQL Editor
- [ ] Copy isi file `supabase_setup_complete.sql`
- [ ] Paste ke SQL Editor
- [ ] Klik tombol "Run"
- [ ] Pastikan tidak ada error (cek output di bawah)
- [ ] Verifikasi tabel sudah dibuat:
  ```sql
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('article_likes', 'article_comments', 'notifications');
  ```
  Harus return 3 rows

### Step 2: Verifikasi Triggers

- [ ] Jalankan query verifikasi:
  ```sql
  SELECT trigger_name, event_object_table
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
  AND event_object_table IN ('article_likes', 'article_comments');
  ```
- [ ] Harus ada 2 triggers:
  - `on_article_like_insert` on `article_likes`
  - `on_article_comment_insert` on `article_comments`

## 🔑 Environment Variables

- [ ] Buka file `.env` di root project
- [ ] Tambahkan/update konfigurasi berikut:

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

- [ ] Dapatkan credentials dari Supabase:
  - Settings → API → Project URL → Copy ke `PUBLIC_SUPABASE_URL`
  - Settings → API → Project API keys → anon/public → Copy ke `PUBLIC_SUPABASE_ANON_KEY`
  - Settings → API → Project API keys → service_role → Copy ke `SUPABASE_SERVICE_ROLE_KEY`

- [ ] Restart dev server setelah update .env:
  ```bash
  # Stop server (Ctrl+C)
  npm run dev
  ```

## 🧪 Testing

### Test 1: NotificationBell Visibility

- [ ] Buka browser ke `http://localhost:4321/admin/dashboard`
- [ ] NotificationBell (icon 🔔) harus muncul di header
- [ ] Buka `http://localhost:4321/` (homepage)
- [ ] NotificationBell TIDAK boleh muncul
- [ ] Buka `http://localhost:4321/blog`
- [ ] NotificationBell TIDAK boleh muncul

### Test 2: Database Connection

- [ ] Buka browser console (F12)
- [ ] Buka `/admin/dashboard`
- [ ] Klik NotificationBell
- [ ] Tidak ada error di console
- [ ] Panel dropdown muncul
- [ ] Jika ada notifikasi lama, harus tampil

### Test 3: Manual Notification (SQL)

- [ ] Buka Supabase SQL Editor
- [ ] Jalankan query test:
  ```sql
  INSERT INTO notifications (type, title, message, metadata, read)
  VALUES (
      'like',
      '❤️ Like Baru',
      'Test notification dari SQL',
      '{"test": true}',
      false
  );
  ```
- [ ] Kembali ke `/admin/dashboard`
- [ ] Badge merah dengan angka "1" harus muncul di bell icon
- [ ] Klik bell → notifikasi test harus tampil
- [ ] Klik notifikasi → status berubah jadi "read"
- [ ] Badge berkurang

### Test 4: Like Notification (End-to-End)

- [ ] Buka `/admin/dashboard` di tab 1
- [ ] Buka artikel (contoh: `/blog/artikel-anda`) di tab 2
- [ ] Scroll ke bawah sampai floating like button muncul
- [ ] Klik like button (❤️)
- [ ] Lihat pesan "Terima kasih sudah apresiasi!"
- [ ] Kembali ke tab 1 (`/admin/dashboard`)
- [ ] Tunggu max 10 detik (polling interval)
- [ ] Badge di bell icon harus bertambah
- [ ] Klik bell → notifikasi like baru harus ada
- [ ] Notifikasi harus menampilkan:
  - Icon ❤️
  - Judul "Like Baru"
  - Pesan dengan nama artikel
  - Waktu "Baru saja" atau "X menit lalu"

### Test 5: Comment Notification (End-to-End)

- [ ] Buka `/admin/dashboard` di tab 1
- [ ] Buka artikel di tab 2
- [ ] Scroll ke bawah, klik comment button (💬)
- [ ] Isi form komentar:
  - Nama: "Test User"
  - Komentar: "Ini komentar test untuk notifikasi"
- [ ] Submit komentar
- [ ] Lihat pesan "Komentar terkirim!"
- [ ] Kembali ke tab 1
- [ ] Tunggu max 10 detik
- [ ] Badge di bell icon harus bertambah
- [ ] Klik bell → notifikasi comment baru harus ada
- [ ] Notifikasi harus menampilkan:
  - Icon 💬
  - Judul "Komentar Baru"
  - Pesan dengan nama artikel
  - Preview komentar (max 100 karakter)

### Test 6: Notification Actions

- [ ] Klik bell icon untuk buka panel
- [ ] Test filter buttons:
  - [ ] Klik "Semua" → tampil semua notifikasi
  - [ ] Klik "Like" → hanya tampil notifikasi like
  - [ ] Klik "Komentar" → hanya tampil notifikasi comment
- [ ] Test mark as read:
  - [ ] Klik satu notifikasi unread
  - [ ] Dot biru di kanan harus hilang
  - [ ] Badge count berkurang
- [ ] Test delete:
  - [ ] Hover notifikasi
  - [ ] Klik tombol X di kanan
  - [ ] Notifikasi hilang
  - [ ] Badge count update
- [ ] Test mark all read:
  - [ ] Klik icon ✓✓ di header panel
  - [ ] Semua notifikasi jadi read
  - [ ] Badge hilang
- [ ] Test clear all:
  - [ ] Klik icon 🗑️ di header panel
  - [ ] Konfirmasi "Hapus semua notifikasi?"
  - [ ] Klik OK
  - [ ] Semua notifikasi hilang
  - [ ] Tampil "Belum ada notifikasi."

## 🔍 Troubleshooting

### ❌ NotificationBell tidak muncul di admin

**Cek:**
- [ ] File `src/components/Header.astro` line 8-9:
  ```typescript
  const currentPath = Astro.url.pathname;
  const isAdminPage = currentPath.startsWith('/admin');
  ```
- [ ] File `src/components/Header.astro` line 32:
  ```astro
  <NotificationBell isAdmin={isAdminPage} />
  ```
- [ ] File `src/components/NotificationBell.astro` line 7-16:
  ```typescript
  interface Props {
      isAdmin?: boolean;
  }
  const { isAdmin = false } = Astro.props;
  if (!isAdmin) return null;
  ```
- [ ] Clear browser cache dan restart dev server

### ❌ Notifikasi tidak muncul setelah like/comment

**Cek:**
- [ ] Browser console untuk error
- [ ] Network tab → cek request ke Supabase berhasil (status 200/201)
- [ ] Supabase Table Editor → cek data masuk ke `article_likes` atau `article_comments`
- [ ] Supabase Table Editor → cek data masuk ke `notifications`
- [ ] Jika data masuk ke likes/comments tapi tidak ke notifications:
  - [ ] Triggers mungkin tidak aktif
  - [ ] Jalankan ulang `supabase_triggers.sql`

### ❌ Error "Supabase configuration missing"

**Cek:**
- [ ] File `.env` ada di root project
- [ ] Semua 3 env variables sudah diisi:
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Tidak ada typo di nama variable
- [ ] Restart dev server setelah update .env

### ❌ Trigger tidak jalan

**Cek:**
- [ ] Jalankan query verifikasi:
  ```sql
  SELECT * FROM information_schema.triggers
  WHERE event_object_table IN ('article_likes', 'article_comments');
  ```
- [ ] Jika kosong, jalankan ulang `supabase_triggers.sql`
- [ ] Test manual trigger:
  ```sql
  INSERT INTO article_likes (slug, user_hash)
  VALUES ('test', 'test-user');
  
  SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 1;
  ```
- [ ] Jika masih tidak ada notifikasi, cek Supabase logs untuk error

### ❌ Badge tidak update setelah mark as read

**Cek:**
- [ ] Browser console untuk error
- [ ] Network tab → cek request PATCH berhasil
- [ ] Refresh halaman untuk force reload
- [ ] Cek Supabase Table Editor → kolom `read` harus berubah jadi `true`

## ✅ Setup Complete!

Jika semua checklist di atas sudah ✅, maka sistem notifikasi sudah berfungsi dengan baik!

### Next Steps (Optional)

- [ ] Setup Telegram integration (lihat `NOTIFICATION_SETUP.md`)
- [ ] Enable Supabase Realtime untuk instant notifications
- [ ] Customize polling interval (default 10s)
- [ ] Add authentication untuk API endpoints
- [ ] Setup email notifications

## 📚 Dokumentasi

- `NOTIFICATION_QUICKSTART.md` - Quick start guide
- `NOTIFICATION_SETUP.md` - Setup lengkap + troubleshooting
- `CHANGELOG_NOTIFICATIONS.md` - Summary perubahan
- `ARCHITECTURE_NOTIFICATIONS.md` - Arsitektur sistem

## 🆘 Butuh Bantuan?

Jika masih ada masalah setelah mengikuti checklist ini:

1. Cek semua file dokumentasi di atas
2. Cek Supabase logs untuk error
3. Cek browser console untuk error
4. Cek Network tab untuk failed requests
5. Restart dev server dan clear browser cache

---

**Checklist Version:** 1.0.0
**Last Updated:** 2025-12-02
