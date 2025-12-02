# Troubleshooting Sistem Notifikasi

Panduan lengkap untuk mengatasi masalah pada sistem notifikasi, termasuk fitur popover.

## 🔍 Masalah Umum

### 1. Popover Tidak Muncul
**Gejala:** Klik notifikasi tapi tidak ada yang terjadi.
**Solusi:**
- Refresh browser (Hard Refresh: Ctrl+Shift+R)
- Pastikan JavaScript tidak error di console
- Cek apakah notifikasi yang diklik masih ada di database

### 2. Badge Tidak Update
**Gejala:** Sudah baca notifikasi tapi badge masih merah.
**Solusi:**
- Tunggu 10 detik (interval polling otomatis)
- Refresh halaman
- Cek koneksi internet

### 3. Notifikasi Tidak Masuk
**Gejala:** Sudah like/comment tapi tidak ada notifikasi.
**Solusi:**
- Cek Supabase triggers (lihat `NOTIFICATION_SETUP.md`)
- Pastikan user tidak memblokir JavaScript

## 🛠️ Debugging Popover

Jika popover bermasalah, gunakan langkah ini:

### Step 1: Cek Console
Buka Developer Tools (F12) -> Console. Cek apakah ada error merah.

### Step 2: Manual Test CSS
Jalankan script ini di console untuk memastikan CSS popover bekerja:

```javascript
const test = document.createElement('div');
test.className = 'notification-popover visible';
test.style.position = 'fixed';
test.style.top = '100px';
test.style.left = '100px';
test.style.zIndex = '10000';
test.innerHTML = '<div style="padding:20px;background:white;border:1px solid #ccc">TEST POPOVER</div>';
document.body.appendChild(test);
setTimeout(() => test.remove(), 3000);
```
Jika kotak putih muncul, berarti CSS aman. Masalah ada di logic JavaScript.

### Step 3: Cek DOM Elements
1. Buka tab **Elements** di DevTools
2. Cari `.notification-popover`
3. Cek apakah class `visible` ada
4. Cek `z-index` dan `opacity`

## 📝 Teknis

### Struktur Popover
Popover dibuat secara dinamis menggunakan JavaScript (`document.createElement`) dan di-append ke `document.body`.

```html
<div class="notification-popover visible" style="left: ...; top: ...">
  <div class="popover-header">...</div>
  <div class="popover-body">...</div>
  <div class="popover-footer">...</div>
</div>
```

### Positioning Logic
- Default: Muncul di sebelah **kanan** notifikasi
- Fallback: Muncul di sebelah **kiri** jika tidak cukup ruang di kanan
- Center: Muncul di **tengah** jika layar mobile (< 640px)

### Event Listeners
- **Click Notifikasi:** Buka popover & mark as read
- **Hover Notifikasi (1s):** Mark as read
- **Click Outside:** Tutup popover
- **ESC Key:** Tutup popover

## 🆘 Masih Bermasalah?

Jika masalah berlanjut:
1. Screenshot error di console
2. Screenshot tampilan saat error
3. Kirim ke tim developer

---
**Versi:** 1.0.0
**Update Terakhir:** 2 Desember 2024
