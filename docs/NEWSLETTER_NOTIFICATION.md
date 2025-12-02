# Newsletter Subscriber Notification System

Sistem notifikasi otomatis untuk memberitahu admin ketika ada subscriber baru yang mendaftar newsletter.

## 📋 Fitur

- ✅ Notifikasi real-time via Telegram Bot
- ✅ Notifikasi via Discord Webhook (alternative)
- ✅ Validasi dan sanitasi email
- ✅ Logging analytics event
- ✅ Informasi lengkap subscriber (email, waktu, halaman asal, user agent)
- ✅ Fallback logging jika service tidak dikonfigurasi

## 🚀 Setup

### Opsi 1: Telegram Bot (Recommended)

Telegram Bot adalah cara termudah dan gratis untuk menerima notifikasi.

#### Langkah-langkah:

1. **Buat Bot Baru**
   - Buka Telegram dan cari `@BotFather`
   - Kirim pesan `/newbot`
   - Ikuti instruksi untuk memberi nama bot
   - Simpan **Bot Token** yang diberikan

2. **Dapatkan Chat ID**
   - Kirim pesan apapun ke bot yang baru dibuat
   - Buka browser dan akses:
     ```
     https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
     ```
   - Cari field `"chat":{"id":123456789}` dan simpan angka tersebut sebagai **Chat ID**

3. **Konfigurasi Environment Variables**
   
   Tambahkan ke file `.env`:
   ```env
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   TELEGRAM_CHAT_ID=123456789
   ```

### Opsi 2: Discord Webhook

Jika Anda lebih suka menggunakan Discord:

1. **Buat Webhook**
   - Buka Discord Server Settings
   - Pilih **Integrations** > **Webhooks**
   - Klik **New Webhook**
   - Beri nama (misal: "Newsletter Notifications")
   - Copy **Webhook URL**

2. **Konfigurasi Environment Variables**
   
   Tambahkan ke file `.env`:
   ```env
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
   ```

## 📁 File Structure

```
src/
├── lib/
│   └── email-notification.ts       # Utility functions untuk notifikasi
├── pages/
│   └── api/
│       └── newsletter/
│           └── subscribe.ts        # API endpoint untuk notifikasi
└── components/
    └── SubscribeCard.astro         # Form subscribe (sudah terintegrasi)
```

## 🔧 Cara Kerja

1. User mengisi email di form newsletter
2. Form submit ke Buttondown (service newsletter)
3. Setelah sukses, sistem memanggil API `/api/newsletter/subscribe`
4. API memvalidasi email dan mengirim notifikasi ke:
   - Telegram Bot (jika dikonfigurasi)
   - Discord Webhook (jika dikonfigurasi)
   - Console log (fallback)
5. Admin menerima notifikasi real-time

## 📊 Format Notifikasi

### Telegram
```
🎉 Newsletter Subscriber Baru!

📧 Email: user@example.com
🕒 Waktu: Minggu, 1 Desember 2025 pukul 08.14.20 WIB
📍 Halaman: /blog
🖥️ User Agent: Mozilla/5.0...

---
Notifikasi otomatis dari ibedes.xyz
```

### Discord
Embed card dengan informasi:
- Email subscriber
- Timestamp (waktu Indonesia)
- Halaman asal subscribe
- User agent browser

## 🧪 Testing

### Test API Endpoint

```bash
# Test GET (info endpoint)
curl http://localhost:4321/api/newsletter/subscribe

# Test POST (kirim notifikasi)
curl -X POST http://localhost:4321/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"/test"}'
```

### Test dari Browser Console

```javascript
fetch('/api/newsletter/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    source: window.location.pathname
  })
})
.then(r => r.json())
.then(console.log);
```

## 🔒 Security

- ✅ Email validation dan sanitization
- ✅ Environment variables untuk credentials
- ✅ Error handling yang aman
- ✅ No sensitive data di client-side
- ✅ Rate limiting (bisa ditambahkan jika perlu)

## 🎨 Customization

### Ubah Format Notifikasi

Edit file `src/lib/email-notification.ts`:

```typescript
const emailBody = `
🎉 Newsletter Subscriber Baru!
// Customize format di sini
`;
```

### Tambah Service Lain

Tambahkan di function `sendSubscriberNotification()`:

```typescript
// Opsi 3: Email via SendGrid/Resend/dll
const emailService = import.meta.env.EMAIL_SERVICE_KEY;
if (emailService) {
  // Implementasi email service
}
```

## 📝 Notes

- Notifikasi berjalan asynchronous, tidak memblokir proses subscribe
- Jika notifikasi gagal, subscribe tetap berhasil (fail-safe)
- Semua error di-log ke console untuk debugging
- Support multiple notification channels sekaligus

## 🐛 Troubleshooting

### Notifikasi tidak terkirim

1. Cek environment variables sudah benar
2. Cek console log untuk error messages
3. Test API endpoint secara manual
4. Pastikan bot/webhook masih aktif

### Email tidak valid

API akan return error 400 dengan message:
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

## 📚 Resources

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Discord Webhooks Guide](https://discord.com/developers/docs/resources/webhook)
- [Buttondown API](https://buttondown.email/api)

---

**Dibuat untuk ibedes.xyz** | Last updated: 2025-12-01
