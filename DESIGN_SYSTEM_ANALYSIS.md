# Analisa Design System

Dokumen ini berisi analisis mendalam mengenai Design System yang digunakan pada website ibedes, berdasarkan implementasi di `/design-system`.

## 1. Filosofi Visual
Website ini mengusung gaya **"Retro-Futuristic / Cyberpunk Minimalist"** yang unik. Menggabungkan elemen pixel-art retro dengan tipografi serif yang elegan dan layout modern yang bersih.

## 2. Palet Warna (Color Palette)

Sistem warna dibagi menjadi dua kategori utama:

### A. Zag Palette (Brand Identity)
Warna-warna ini membentuk identitas visual unik "Zag":
- **Zag Dark**: Warna dasar gelap untuk mode malam atau elemen kontras tinggi.
- **Zag Light**: Warna dasar terang untuk mode siang.
- **Zag Muted**: Versi lebih lembut untuk background sekunder atau elemen non-fokus.
- **Zag Accent**: Warna aksen untuk highlight dan interaksi.

### B. Semantic Theme Colors
Warna fungsional yang digunakan di seluruh aplikasi (mendukung Dark/Light mode):
- **Background/Foreground**: Warna dasar halaman dan teks.
- **Primary**: Warna utama untuk aksi penting (tombol, link aktif).
- **Secondary**: Warna pendukung.
- **Muted**: Untuk teks sekunder atau border halus.
- **Accent**: Untuk elemen yang butuh perhatian khusus.
- **Destructive**: Merah untuk error atau aksi berbahaya (hapus).

## 3. Tipografi (Typography)

Penggunaan font yang sangat terstruktur menciptakan hierarki visual yang kuat:

1.  **Display Font: `Press Start 2P`**
    *   **Gaya**: Pixel art / 8-bit retro.
    *   **Penggunaan**: Judul besar (H1), Header section, elemen dekoratif.
    *   **Kesan**: Memberikan nuansa "gaming" dan retro yang kuat.

2.  **Serif Font: `Literata Variable`**
    *   **Gaya**: Modern Serif dengan legabilitas tinggi.
    *   **Penggunaan**: Body text, paragraf, artikel blog.
    *   **Kesan**: Memberikan sentuhan elegan, editorial, dan nyaman dibaca untuk teks panjang.

3.  **Mono Font: `IBM Plex Mono`**
    *   **Gaya**: Monospace / Typewriter.
    *   **Penggunaan**: Metadata (tanggal, tags), label kecil, kode, elemen UI teknis.
    *   **Kesan**: Teknis, rapi, dan informatif.

## 4. Komponen UI (Components)

### Buttons (Tombol)
- **Primary**: Solid color, sudut membulat (rounded-xl), efek hover transform (naik sedikit).
- **Secondary**: Outline atau warna background lebih pudar.
- **Ghost**: Transparan, hanya teks dan icon.

### Cards (Kartu)
- Menggunakan border tebal (`border-[3px]`) yang memberikan kesan "timbul" atau "kartun".
- Sudut membulat (`rounded-xl`).
- Sering dikombinasikan dengan background pattern atau warna "Zag".

### Inputs (Formulir)
- Border tebal dan tegas.
- Font Monospace untuk input text.
- Fokus state yang jelas dengan warna aksen (Emerald/Primary).

### Navigasi & Breadcrumbs
- Minimalis.
- Menggunakan font Monospace atau Serif kecil.
- Ikon panah kustom untuk link navigasi (`service-link`).

## 5. Ikonografi
- Menggunakan **FontAwesome 6** (Brands & Solid).
- Ikon sering digunakan sebagai indikator visual di samping teks (misal: di tombol, tab, atau metadata).

## 6. Layout & Spacing
- **Container**: Terpusat dengan padding yang nyaman (`px-4`).
- **Grid System**: Responsif (1 kolom di mobile, 2-4 kolom di desktop).
- **Whitespace**: Penggunaan ruang kosong yang cukup luas (space-y-8, gap-12) agar desain tidak terasa padat meskipun menggunakan font tebal.

---

**Kesimpulan:**
Design system ini berhasil menciptakan identitas yang kuat dengan menyeimbangkan elemen "fun" (retro pixel) dengan "function" (serif untuk bacaan). Konsistensi penggunaan border tebal dan font monospace menjadi ciri khas visual yang menyatukan seluruh halaman.
