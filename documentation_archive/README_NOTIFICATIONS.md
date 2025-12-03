# 🔔 Sistem Notifikasi - Dokumentasi Lengkap

Sistem notifikasi terintegrasi untuk admin dashboard dengan Supabase.

## 📖 Dokumentasi

Pilih dokumentasi sesuai kebutuhan:

### 🚀 Quick Start
**File:** [`NOTIFICATION_QUICKSTART.md`](./NOTIFICATION_QUICKSTART.md)

Untuk setup cepat dalam 5 menit. Cocok jika Anda sudah familiar dengan Supabase.

**Isi:**
- Setup 3 langkah
- Troubleshooting cepat
- File penting

---

### ✅ Checklist Setup
**File:** [`CHECKLIST_NOTIFICATIONS.md`](./CHECKLIST_NOTIFICATIONS.md)

Checklist lengkap untuk memastikan semua langkah setup sudah benar.

**Isi:**
- Pre-setup checklist
- Database setup checklist
- Environment variables checklist
- Testing checklist (6 test scenarios)
- Troubleshooting per masalah

---

### 📚 Setup Lengkap
**File:** [`NOTIFICATION_SETUP.md`](./NOTIFICATION_SETUP.md)

Dokumentasi lengkap dengan penjelasan detail dan troubleshooting.

**Isi:**
- Persiapan tabel Supabase
- Konfigurasi environment
- Cara kerja sistem (flow diagram)
- Testing manual dan SQL
- Troubleshooting detail
- Fitur tambahan (Realtime, Telegram)
- Struktur database

---

### 📝 Changelog
**File:** [`CHANGELOG_NOTIFICATIONS.md`](./CHANGELOG_NOTIFICATIONS.md)

Summary lengkap semua perubahan dan perbaikan.

**Isi:**
- Masalah yang diperbaiki
- Solusi yang diterapkan
- File yang diubah/dibuat
- Cara kerja sistem
- Testing guide
- API endpoints

---

### 🏗️ Arsitektur
**File:** [`ARCHITECTURE_NOTIFICATIONS.md`](./ARCHITECTURE_NOTIFICATIONS.md)

Dokumentasi arsitektur dengan diagram visual.

**Isi:**
- Diagram flow lengkap
- Component hierarchy
- Data flow detail
- File structure
- Key features
- Security (RLS)
- Performance optimization

---

### 🔧 Troubleshooting
**File:** [`NOTIFICATION_TROUBLESHOOTING.md`](./NOTIFICATION_TROUBLESHOOTING.md)

Panduan mengatasi masalah umum.

**Isi:**
- Masalah umum & solusi
- Debugging popover
- Manual test scripts

---

## 🗂️ File SQL

### Setup Lengkap (Recommended)
**File:** [`supabase_setup_complete.sql`](./supabase_setup_complete.sql)

Satu file SQL yang menggabungkan semua setup:
- Tabel `article_likes`
- Tabel `article_comments`
- Tabel `notifications`
- Triggers untuk auto-notification
- Verifikasi queries

**Cara pakai:**
1. Buka Supabase SQL Editor
2. Copy-paste isi file ini
3. Klik "Run"
4. Done! ✅

---

### Setup Terpisah (Optional)

Jika ingin setup step-by-step:

1. **`supabase_engagement_tables.sql`**
   - Tabel `article_likes`
   - Tabel `article_comments`
   - Indexes dan RLS policies

2. **`supabase_notifications.sql`**
   - Tabel `notifications`
   - Indexes dan RLS policies

3. **`supabase_triggers.sql`**
   - Triggers untuk auto-notification
   - Functions `notify_new_like()` dan `notify_new_comment()`

---

## 🎯 Rekomendasi Workflow

### Untuk Pemula
1. Baca [`NOTIFICATION_QUICKSTART.md`](./NOTIFICATION_QUICKSTART.md)
2. Ikuti [`CHECKLIST_NOTIFICATIONS.md`](./CHECKLIST_NOTIFICATIONS.md)
3. Jika ada masalah, lihat [`NOTIFICATION_SETUP.md`](./NOTIFICATION_SETUP.md)

### Untuk Developer Berpengalaman
1. Jalankan [`supabase_setup_complete.sql`](./supabase_setup_complete.sql)
2. Setup environment variables
3. Test langsung
4. Jika perlu detail, lihat [`ARCHITECTURE_NOTIFICATIONS.md`](./ARCHITECTURE_NOTIFICATIONS.md)

### Untuk Troubleshooting
1. Cek [`CHECKLIST_NOTIFICATIONS.md`](./CHECKLIST_NOTIFICATIONS.md) → Troubleshooting section
2. Jika belum solved, lihat [`NOTIFICATION_SETUP.md`](./NOTIFICATION_SETUP.md) → Troubleshooting section
3. Cek Supabase logs dan browser console

---

## 🔧 Quick Setup (TL;DR)

```bash
# 1. Jalankan SQL di Supabase
# Copy-paste isi file: supabase_setup_complete.sql

# 2. Update .env
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# 3. Restart dev server
npm run dev

# 4. Test
# - Buka /admin/dashboard → Bell icon harus muncul
# - Like artikel → Notifikasi harus muncul
```

---

## ✨ Fitur Utama

- ✅ **NotificationBell hanya muncul di halaman admin** (`/admin/*`)
- ✅ **Auto-notification via Supabase triggers** (like & comment)
- ✅ **Real-time polling** setiap 10 detik
- ✅ **Dual storage** (Supabase + localStorage fallback)
- ✅ **Filter notifikasi** (All, Newsletter, Like, Comment)
- ✅ **Mark as read** (individual atau semua)
- ✅ **Delete notification** (individual atau semua)
- ✅ **Badge counter** dengan animasi
- ✅ **Responsive UI** (desktop & mobile)
- ✅ **Dark mode support**

---

## 📊 Struktur Database

### Tabel: `notifications`
Menyimpan semua notifikasi admin

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| type | TEXT | 'newsletter', 'like', 'comment', 'bookmark' |
| title | TEXT | Judul notifikasi |
| message | TEXT | Pesan notifikasi |
| metadata | JSONB | Data tambahan |
| timestamp | TIMESTAMPTZ | Waktu dibuat |
| read | BOOLEAN | Status baca |

### Tabel: `article_likes`
Menyimpan likes untuk artikel

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| slug | TEXT | Slug artikel |
| user_hash | TEXT | Hash user |
| created_at | TIMESTAMPTZ | Waktu dibuat |

### Tabel: `article_comments`
Menyimpan komentar untuk artikel

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| slug | TEXT | Slug artikel |
| name | TEXT | Nama komentator |
| message | TEXT | Isi komentar |
| status | TEXT | 'published', 'pending', 'spam' |
| created_at | TIMESTAMPTZ | Waktu dibuat |

---

## 🔗 API Endpoints

### `GET /api/admin/notifications`
Ambil semua notifikasi

**Query params:**
- `since` - Filter notifikasi setelah timestamp
- `type` - Filter by type
- `unread` - true untuk hanya unread

### `POST /api/admin/notifications`
Buat notifikasi baru

**Body:**
```json
{
  "type": "like",
  "metadata": { "articleSlug": "...", "articleTitle": "..." }
}
```

### `PATCH /api/admin/notifications?id={id}`
Mark notifikasi sebagai read

### `PATCH /api/admin/notifications?markAllRead=true`
Mark semua notifikasi sebagai read

### `DELETE /api/admin/notifications?id={id}`
Hapus notifikasi tertentu

### `DELETE /api/admin/notifications`
Hapus semua notifikasi

---

## 🎨 Komponen

### `NotificationBell.astro`
UI komponen bell icon dengan dropdown panel

**Props:**
- `isAdmin` (boolean) - Kontrol visibility

**Features:**
- Badge counter dengan animasi
- Dropdown panel dengan filters
- Mark as read / delete actions
- Polling setiap 10 detik
- Keyboard navigation (ESC to close)

### `Header.astro`
Header dengan admin detection

**Logic:**
```typescript
const isAdminPage = currentPath.startsWith('/admin');
<NotificationBell isAdmin={isAdminPage} />
```

---

## 🔐 Security

### Row Level Security (RLS)
Semua tabel menggunakan RLS policies:

- **Admin** (authenticated) → Full access
- **Anonymous** → Read + Insert only
- **Published comments** → Public read

### API Protection
Untuk production, tambahkan authentication:

```typescript
// src/pages/api/admin/notifications.ts
export const GET: APIRoute = async ({ request }) => {
    // TODO: Add admin auth check
    // const session = await getSession(request);
    // if (!session?.user?.isAdmin) return 401;
    
    // ... rest of code
};
```

---

## 🚀 Next Steps (Optional)

- [ ] Setup Telegram integration
- [ ] Enable Supabase Realtime
- [ ] Add browser push notifications
- [ ] Add email notifications
- [ ] Add notification preferences
- [ ] Add authentication untuk API

---

## 📞 Support

Jika ada pertanyaan atau masalah:

1. Cek dokumentasi di atas
2. Cek Supabase logs
3. Cek browser console
4. Cek Network tab

---

**Version:** 1.0.0  
**Last Updated:** 2025-12-02  
**Status:** ✅ Production Ready
