# Sistem Notifikasi Terintegrasi

Sistem notifikasi baru yang lebih modern dan terintegrasi dengan icon di header.

## 📋 Fitur

- ✅ Icon notifikasi di header yang selalu terlihat
- ✅ Badge counter untuk notifikasi yang belum dibaca
- ✅ Dropdown panel dengan animasi smooth
- ✅ Filter notifikasi berdasarkan tipe (All, Newsletter, Like, Comment)
- ✅ Real-time updates menggunakan localStorage dan custom events
- ✅ Responsive design (desktop & mobile)
- ✅ Auto-polling setiap 10 detik
- ✅ Toast notifications untuk feedback
- ✅ Integrasi dengan Telegram untuk like & comment

## 🎯 Komponen Utama

### 1. NotificationBell.astro
Komponen icon notifikasi yang ditampilkan di header.

**Lokasi**: `/src/components/NotificationBell.astro`

**Fitur**:
- Icon bell dengan badge counter
- Dropdown panel untuk menampilkan daftar notifikasi
- Filter berdasarkan tipe notifikasi
- Mark all as read & clear all actions
- Auto-close saat klik di luar panel
- Keyboard support (ESC untuk menutup)

### 2. notifications.ts
Library untuk mengelola notifikasi di localStorage.

**Lokasi**: `/src/lib/notifications.ts`

**Fungsi utama**:
- `loadNotifications()` - Load notifikasi dari localStorage
- `addNotification()` - Tambah notifikasi baru
- `markAsRead()` - Tandai notifikasi sebagai sudah dibaca
- `markAllAsRead()` - Tandai semua notifikasi sebagai sudah dibaca
- `deleteNotification()` - Hapus notifikasi tertentu
- `clearAllNotifications()` - Hapus semua notifikasi
- `formatNotification()` - Format notifikasi berdasarkan tipe

### 3. admin-notifications-client.ts
Client-side helper untuk mengirim notifikasi.

**Lokasi**: `/src/lib/admin-notifications-client.ts`

**Fungsi utama**:
- `sendAdminNotification()` - Kirim notifikasi ke admin
- `notifyLike()` - Kirim notifikasi untuk like baru
- `notifyComment()` - Kirim notifikasi untuk komentar baru
- `notifyBookmark()` - Kirim notifikasi untuk bookmark baru

## 📊 Tipe Notifikasi

### Newsletter
- **Icon**: 📧 Envelope
- **Warna**: Green (#10b981)
- **Trigger**: Saat ada subscriber baru
- **Metadata**: email, source

### Like
- **Icon**: ❤️ Heart
- **Warna**: Red (#ef4444)
- **Trigger**: Saat artikel mendapat like
- **Metadata**: articleSlug, articleTitle, userHash
- **Telegram**: ✅ Ya

### Comment
- **Icon**: 💬 Comment
- **Warna**: Blue (#3b82f6)
- **Trigger**: Saat ada komentar baru
- **Metadata**: articleSlug, articleTitle, commentText, userHash
- **Telegram**: ✅ Ya

### Bookmark
- **Icon**: 🔖 Bookmark
- **Warna**: Orange (#f59e0b)
- **Trigger**: Saat artikel di-bookmark
- **Metadata**: articleSlug, articleTitle, userHash

## 🔧 Cara Menggunakan

### Mengirim Notifikasi dari Client

```javascript
import { notifyLike, notifyComment, notifyBookmark } from '../lib/admin-notifications-client';

// Kirim notifikasi like
notifyLike('artikel-slug', 'Judul Artikel');

// Kirim notifikasi comment
notifyComment('artikel-slug', 'Judul Artikel', 'Isi komentar...');

// Kirim notifikasi bookmark
notifyBookmark('artikel-slug', 'Judul Artikel');
```

### Mengirim Notifikasi Newsletter

Notifikasi newsletter otomatis terkirim saat ada subscriber baru melalui API `/api/newsletter/subscribe`.

### Custom Event Listener

```javascript
// Listen untuk notifikasi baru
window.addEventListener('notification:new', (e) => {
    console.log('Notifikasi baru:', e.detail);
});
```

## 🎨 Styling

Komponen menggunakan CSS variables untuk theming:
- `--color-foreground` - Warna teks utama
- `--color-background` - Warna background
- `--color-card` - Warna card/panel
- `--font-display` - Font untuk title
- `--font-mono` - Font untuk badge counter

## 📱 Responsive Design

### Desktop
- Panel dropdown muncul di bawah icon bell
- Lebar panel: 400px
- Max height: 600px

### Mobile
- Panel muncul dari bawah layar (bottom sheet)
- Full width
- Max height: 80vh
- Filter chips hanya menampilkan icon

## 🔔 Notifikasi Telegram

Untuk like dan comment, sistem otomatis mengirim notifikasi ke Telegram Bot.

**Environment Variables**:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

**Format Pesan**:
```
❤️ Like Baru!

📄 Artikel: [Judul Artikel]
🔗 Slug: artikel-slug
👤 User: user_hash
🕒 Waktu: 01/12/2025, 22:08:04

---
Notifikasi otomatis dari ibedes.xyz
```

## 🚀 Auto-Polling

Sistem melakukan polling setiap 10 detik untuk memeriksa notifikasi baru dari localStorage.

Interval dapat diubah di `NotificationBell.astro`:
```javascript
this.checkInterval = window.setInterval(() => {
    this.loadAndDisplay();
}, 10000); // 10 detik
```

## 💾 Storage

Notifikasi disimpan di localStorage dengan key: `ibedes:admin:notifications`

**Format**:
```json
{
  "notifications": [
    {
      "id": "1701234567890-abc123",
      "type": "like",
      "title": "❤️ Like Baru",
      "message": "Artikel \"Judul\" mendapat like",
      "metadata": {
        "articleSlug": "artikel-slug",
        "articleTitle": "Judul Artikel",
        "userHash": "user_hash"
      },
      "timestamp": "2025-12-01T15:08:04.000Z",
      "read": false
    }
  ],
  "unreadCount": 1
}
```

## 🔒 Security

- ✅ HTML escaping untuk mencegah XSS
- ✅ User hash untuk anonymity
- ✅ Rate limiting bisa ditambahkan di API
- ✅ Telegram credentials di environment variables

## 🎯 Perubahan dari Sistem Lama

### Dihapus
- ❌ `UnifiedNotifications.astro` (komponen di dashboard)
- ❌ `SubscriptionNotifications.astro` (komponen terpisah)
- ❌ `TestNotificationButtons.astro` (tombol test)

### Ditambahkan
- ✅ `NotificationBell.astro` (icon di header)
- ✅ Integrasi di Header.astro
- ✅ Dropdown panel yang lebih modern
- ✅ Mobile-friendly bottom sheet

### Tetap Digunakan
- ✅ `notifications.ts` (library core)
- ✅ `admin-notifications-client.ts` (client helper)
- ✅ `/api/admin/notifications.ts` (API endpoint)
- ✅ Integrasi Telegram

## 📝 Notes

- Notifikasi bersifat client-side (localStorage)
- Tidak ada persistence di server
- Notifikasi hilang jika localStorage di-clear
- Telegram notification tetap terkirim meskipun localStorage di-clear
- Polling hanya berjalan saat tab aktif

## 🐛 Troubleshooting

### Badge tidak muncul
- Pastikan ada notifikasi yang belum dibaca
- Check localStorage: `ibedes:admin:notifications`

### Panel tidak muncul
- Check console untuk error
- Pastikan z-index tidak tertimpa

### Notifikasi tidak real-time
- Polling interval: 10 detik
- Force refresh dengan reload page

### Telegram tidak terkirim
- Check environment variables
- Check console untuk error
- Test dengan curl manual

---

**Dibuat untuk ibedes.xyz** | Last updated: 2025-12-01
