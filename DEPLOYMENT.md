# Deployment Checklist - Netlify

## Environment Variables yang Diperlukan

Pastikan semua environment variables berikut sudah di-set di **Netlify Dashboard** → **Site settings** → **Environment variables**:

### 1. Supabase (WAJIB)
```
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**⚠️ PENTING**: `SUPABASE_SERVICE_ROLE_KEY` harus di-set di Netlify agar produk affiliate bisa muncul di artikel!

### 2. GitHub (Opsional - untuk auto-commit dari editor)
```
GITHUB_TOKEN=your-github-token
GITHUB_REPO=username/repo-name
GITHUB_BRANCH=main
```

### 3. Telegram (Opsional - untuk notifikasi)
```
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

### 4. Google Analytics (Opsional)
```
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Cara Set Environment Variables di Netlify

1. Buka **Netlify Dashboard**
2. Pilih site kamu
3. Klik **Site settings** → **Environment variables**
4. Klik **Add a variable**
5. Masukkan **Key** dan **Value**
6. Pilih scope: **All scopes** (atau sesuai kebutuhan)
7. Klik **Create variable**
8. Ulangi untuk semua variables yang diperlukan
9. **Trigger redeploy** agar perubahan diterapkan

## Troubleshooting

### Produk affiliate tidak muncul di artikel

**Penyebab**: `SUPABASE_SERVICE_ROLE_KEY` tidak di-set di Netlify

**Solusi**:
1. Cek di Netlify → Environment variables
2. Pastikan `SUPABASE_SERVICE_ROLE_KEY` ada dan valuenya benar
3. Trigger redeploy

### Artikel tidak bisa disimpan

**Penyebab**: `SUPABASE_SERVICE_ROLE_KEY` tidak di-set

**Solusi**: Sama seperti di atas

### Build gagal

**Penyebab**: Environment variables tidak tersedia saat build

**Solusi**:
- Pastikan semua `PUBLIC_*` variables sudah di-set
- Cek build logs untuk error spesifik
- Jika perlu, set `NODE_ENV=production`

## Verifikasi Deployment

Setelah deploy, cek:
1. ✅ Homepage loading dengan benar
2. ✅ Artikel bisa dibuka
3. ✅ Produk affiliate muncul di artikel (jika ada)
4. ✅ Admin dashboard bisa diakses
5. ✅ Bisa tambah/edit/hapus artikel
6. ✅ Bisa tambah/edit/hapus produk

## Notes

- **SSR Mode**: Site ini menggunakan SSR di production untuk query database saat runtime
- **Database**: Semua data (artikel, produk, likes, comments) disimpan di Supabase
- **Static Assets**: Images dan file lain di-serve dari `/public`
