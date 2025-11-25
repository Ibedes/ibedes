# Panduan Sistem & Cara Kerja Website

Dokumen ini menjelaskan cara kerja teknis website ibedes dan panduan penggunaan untuk administrator.

## 🛠️ 1. Sistem Kerja Website (Technical Overview)

Website ini menggunakan arsitektur **"Git-based Headless CMS"**. Artinya, website tidak menggunakan database tradisional (seperti MySQL), melainkan menggunakan file (Markdown & JSON) yang tersimpan di GitHub sebagai database.

### Alur Kerja (Workflow):

1.  **Admin Panel**: Anda melakukan perubahan (tulis artikel, tambah produk) di dashboard admin (`/admin`).
2.  **GitHub API**: Sistem secara otomatis mengirim perubahan tersebut ke repository GitHub Anda menggunakan GitHub API.
    *   Artikel disimpan sebagai file `.md` di `src/pages/blog/`.
    *   Produk disimpan di `src/data/affiliate-products.json`.
3.  **Auto-Deploy**: Netlify mendeteksi adanya perubahan di GitHub dan otomatis melakukan "Build" ulang.
4.  **Live**: Dalam waktu 1-2 menit, perubahan akan tayang di website utama.

**Keuntungan:**
*   **Gratis & Hemat**: Tidak perlu sewa server database mahal.
*   **Cepat**: Website disajikan sebagai file statis (HTML/CSS) yang sangat cepat.
*   **Aman**: Tidak ada celah keamanan database SQL injection.

---

## 📖 2. Panduan Pengguna (User Guide)

### A. Mengakses Admin Dashboard
1.  Buka `https://ibedes.xyz/admin`
2.  Anda akan diarahkan ke Dashboard utama yang berisi ringkasan statistik.
3.  Gunakan **Tab Menu** (di atas atau dropdown di mobile) untuk navigasi:
    *   **Overview**: Ringkasan.
    *   **Articles**: Kelola blog post.
    *   **Products**: Kelola produk afiliasi.
    *   **Analytics**: Statistik konten.
    *   **Settings**: Pengaturan situs.

### B. Cara Menulis Artikel Baru
1.  Di Dashboard, klik tombol **"New Article"** (atau buka tab Articles > New Article).
2.  **Isi Metadata**:
    *   **Judul**: Judul artikel.
    *   **Deskripsi**: Ringkasan singkat untuk SEO.
    *   **Tanggal**: Otomatis terisi hari ini (bisa diubah).
    *   **Gambar Unggulan**: Upload gambar atau masukkan URL gambar.
3.  **Tulis Konten**:
    *   Gunakan editor di sebelah kiri.
    *   Format penulisan menggunakan **Markdown**.
    *   Contoh: `## Subjudul`, `**teks tebal**`, `*miring*`.
4.  **Hubungkan Produk Afiliasi** (Penting!):
    *   Di panel kanan, bagian "Afiliasi".
    *   Cari produk yang relevan dengan artikel.
    *   Centang produk tersebut.
    *   Produk yang dicentang akan muncul otomatis di dalam artikel (tergantung layout).
5.  Klik **"Simpan"**.
6.  Tunggu notifikasi sukses. Perubahan akan live dalam ~2 menit.

### C. Cara Menambah Produk Afiliasi
1.  Di Dashboard, klik tombol **"Add Product"** (atau buka tab Products > Add Product).
2.  **Isi Data Produk**:
    *   **Product ID**: Kode unik (misal: `sepatu-nike-air`). Huruf kecil, tanpa spasi.
    *   **Nama Produk**: Nama lengkap produk.
    *   **Platform**: Pilih marketplace (Shopee, Tokopedia, dll).
    *   **Link**: Link afiliasi Anda.
    *   **Image URL**: Link gambar produk.
    *   **Harga**: Harga produk (diskon akan dihitung otomatis jika harga coret diisi).
    *   **Kategori & Tags**: Untuk pengelompokan.
3.  Klik **"Simpan Produk"**.

### D. Mengelola Metadata Situs
1.  Buka tab **Settings** > **Site Metadata**.
2.  Di sini Anda bisa mengedit file `src/lib/variables.ts` secara visual (jika fitur ini sudah aktif) atau melihat konfigurasi global situs seperti Judul Situs, Deskripsi Global, dan Sosmed.

---

## 💡 Tips & Trik

*   **Gambar**: Untuk performa terbaik, gunakan gambar yang sudah dikompres (format WebP atau JPG optimize) sebelum diupload.
*   **Markdown**: Pelajari dasar Markdown untuk membuat artikel yang rapi (List, Quote, Link).
*   **Cache**: Jika perubahan tidak muncul setelah 5 menit, coba clear cache browser atau cek status deploy di Netlify.
*   **Mobile**: Admin panel ini responsif, Anda bisa menulis atau mengedit produk langsung dari HP.

---

## ⚠️ Troubleshooting

*   **Gagal Simpan**: Pastikan koneksi internet lancar. Jika error berlanjut, cek apakah token GitHub di Netlify masih valid.
*   **Gambar Tidak Muncul**: Pastikan URL gambar dapat diakses publik.
*   **Perubahan Belum Muncul**: Tunggu minimal 2 menit. Netlify butuh waktu untuk membangun ulang website.
