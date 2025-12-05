# Workflow Manual Deployment

## Overview
Karena repo sudah di-unlink dari GitHub auto-deployment, sekarang menggunakan **manual deployment workflow** dengan strategi hybrid:

- **Development (localhost)**: Edit file lokal + sync ke Supabase
- **Production**: Hanya baca dari Supabase (filesystem read-only)

## Cara Kerja

### 1. Edit/Delete Article di Admin Dashboard

**Di Development (localhost:4322):**
- Save/Delete akan mengubah file `.md` di `src/pages/blog/`
- Sekaligus sync ke Supabase database
- Pesan: *"Article berhasil disimpan ke file lokal dan database"*

**Di Production (ibedes.xyz):**
- Save/Delete hanya mengubah data di Supabase
- Tidak menyentuh filesystem (karena read-only)
- Pesan: *"Article berhasil disimpan ke database. File lokal akan diupdate saat rebuild/deploy berikutnya"*

### 2. Commit & Push Changes

Setelah edit article di localhost:

```bash
# Add all changes
git add .

# Commit dengan pesan yang jelas
git commit -m "Add: New article about X"

# Push ke GitHub
git push origin main
```

### 3. Deploy Manual

Setelah push ke GitHub, deploy secara manual sesuai platform hosting:

**Netlify:**
```bash
# Option 1: Via Netlify CLI
netlify deploy --prod

# Option 2: Via Netlify Dashboard
# Trigger manual deploy di dashboard
```

**Vercel:**
```bash
# Via Vercel CLI
vercel --prod
```

**Atau trigger rebuild via dashboard hosting platform**

### 4. Setelah Deploy

Setelah deploy selesai:
- File markdown di production akan ter-update dari git
- Blog posts akan tetap muncul karena dibaca dari Supabase
- Sinkronisasi antara file dan database terjaga

## Important Notes

⚠️ **Jangan edit article langsung di production!**
- Production hanya untuk melihat hasil akhir
- Semua editing harus dilakukan di localhost
- Lalu commit → push → deploy

✅ **Keuntungan Workflow Ini:**
- Full control kapan deploy
- Bisa review changes sebelum push
- Tidak ada auto-deploy yang tidak diinginkan
- Tetap bisa edit via admin dashboard di localhost

🔄 **Sinkronisasi:**
- Localhost: File → Supabase
- Production: Supabase → Display
- Deploy: Git → Production Files

## Troubleshooting

**Error: "Filesystem read-only" di production**
- ✅ Normal! Production memang read-only
- ✅ Data tetap tersimpan di Supabase
- ✅ File akan update saat deploy berikutnya

**Article tidak muncul di production setelah edit**
- Cek apakah sudah commit & push
- Cek apakah sudah deploy ulang
- Cek Supabase apakah data sudah masuk

**Article muncul di production tapi file belum update**
- Trigger rebuild/deploy ulang
- File akan sync dari git saat build
