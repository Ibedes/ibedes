# Solusi Masalah Delete Produk di Preview Mode

## Status Testing

✅ **API Backend Berfungsi Normal**
- `/api/admin/edit-product` → Status 200 ✅
- `/api/admin/delete-product` → Status 200 ✅
- Response: `{"success":true,"message":"Product deleted"}`

✅ **Konfigurasi SSR Benar**
- Astro config menggunakan `output: "server"`
- Node adapter configured properly
- Environment variables tersedia

## Kemungkinan Penyebab & Solusi

### 1. **JavaScript Browser Cache Issue**

**Masalah**: Browser menggunakan cached version dari JavaScript yang tidak compatible.

**Solusi**:
```bash
# Hard refresh browser (paling mudah)
Ctrl+Shift+R (Windows/Linux) atau Cmd+Shift+R (Mac)

# Atau test di incognito/private mode
# Atau clear browser cache entirely
```

### 2. **Frontend JavaScript Error**

**Debugging Steps**:
1. Buka admin dashboard di browser
2. Tekan **F12** untuk buka Developer Tools
3. Pergi ke tab **Console**
4. Klik tombol delete produk dan lihat error messages

**Yang perlu dicari**:
- `TypeError` atau `ReferenceError`
- CORS errors (tapi ini seharusnya tidak terjadi karena same origin)
- Network errors (404, 500, dll)

### 3. **Environment Variables Issue**

**Test di Browser Console**:
```javascript
// Buka browser console dan jalankan:
console.log('Supabase URL:', import.meta.env?.PUBLIC_SUPABASE_URL);
console.log('Has Config:', !!import.meta.env?.PUBLIC_SUPABASE_URL);
```

**Jika kosong, berarti environment variables tidak ter-load saat preview**.

**Solusi Environment Variables**:
```bash
# Set variables saat build dan preview
PUBLIC_SUPABASE_URL=https://luarxczfretecasloxgz.supabase.co \
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... \
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... \
npm run build && npm run preview
```

### 4. **Clean Restart (Paling Efektif)**

```bash
# Stop semua process
pkill -f "astro"

# Clean semua cache
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .astro/

# Fresh build dan start
npm run build
npm run preview
```

### 5. **Alternative: Development Mode**

Jika preview masih bermasalah, gunakan development mode dengan environment variables:

```bash
# Set environment dan jalankan dev mode
PUBLIC_SUPABASE_URL=https://luarxczfretecasloxgz.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... \
npm run dev
```

## Debugging Checklist

### Step 1: Quick Test
```bash
# Test API langsung
curl -X POST http://localhost:4321/api/admin/delete-product \
  -H "Content-Type: application/json" \
  -d '{"id":"test-product"}'
```

### Step 2: Browser Debug
1. F12 → Console
2. Klik delete button
3. Lihat error messages

### Step 3: Network Tab
1. F12 → Network
2. Klik delete button
3. Lihat request ke `/api/admin/delete-product`
4. Check response status

### Step 4: Clean Restart
```bash
pkill -f astro && rm -rf dist/ .astro/ && npm run build && npm run preview
```

## Kemungkinan Error Messages & Solusi

### "Failed to fetch"
- **Penyebab**: JavaScript error atau CORS
- **Solusi**: Check console untuk error details

### "Network Error"
- **Penyebab**: Server tidak running atau port salah
- **Solusi**: Pastikan preview server running di port 4321

### "TypeError: Cannot read property"
- **Penyebab**: JavaScript runtime error
- **Solusi**: Hard refresh browser atau clean restart

### No response/Loading forever
- **Penyebab**: Server stuck atau infinite loop
- **Solusi**: Restart preview server

## Kesimpulan

Backend API bekerja normal, jadi masalah kemungkinan di **frontend JavaScript** atau **environment variables**.

**Coba Urutan Ini**:
1. **Hard refresh browser** (Ctrl+Shift+R)
2. **Test di incognito mode**
3. **Clean restart** (pkill + rm cache + rebuild)
4. **Debug di browser console** (F12 → Console)

Jika masih bermasalah, share **error message dari browser console** untuk diagnosis lebih lanjut.