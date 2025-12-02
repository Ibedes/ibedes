# 📧 Quick Start - Newsletter Notification

## Setup Cepat (5 Menit)

### 1. Pilih Metode Notifikasi

#### Opsi A: Telegram Bot (Paling Mudah) ⭐

```bash
# 1. Buka Telegram, cari @BotFather
# 2. Kirim: /newbot
# 3. Ikuti instruksi
# 4. Simpan token yang diberikan
```

Dapatkan Chat ID:
```bash
# 1. Kirim pesan ke bot kamu
# 2. Buka di browser (ganti YOUR_BOT_TOKEN):
https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates

# 3. Cari angka di "chat":{"id":123456789}
```

Tambahkan ke `.env`:
```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

#### Opsi B: Discord Webhook

```bash
# 1. Discord Server Settings > Integrations > Webhooks
# 2. New Webhook > Copy URL
```

Tambahkan ke `.env`:
```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### 2. Test Notifikasi

Jalankan dev server:
```bash
npm run dev
```

Buka browser:
```
http://localhost:4321/test-newsletter.html
```

Isi email test dan klik "Send Test Notification"

### 3. Cek Notifikasi

- **Telegram**: Cek bot kamu, harusnya ada pesan masuk
- **Discord**: Cek channel yang dipilih untuk webhook

## ✅ Checklist

- [ ] Environment variables sudah ditambahkan
- [ ] Dev server running
- [ ] Test page bisa diakses
- [ ] Notifikasi terkirim ke Telegram/Discord
- [ ] Form subscribe di website berfungsi

## 🐛 Troubleshooting

### Notifikasi tidak masuk?

1. **Cek environment variables**
   ```bash
   # Pastikan .env ada dan benar
   cat .env
   ```

2. **Cek console log**
   ```bash
   # Lihat error di terminal
   npm run dev
   ```

3. **Test API langsung**
   ```bash
   curl -X POST http://localhost:4321/api/newsletter/subscribe \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","source":"/test"}'
   ```

### Error "Invalid email format"

Email harus format valid: `user@domain.com`

### Error 500

Cek:
- Environment variables benar
- Bot token valid
- Chat ID benar
- Webhook URL aktif

## 📝 Next Steps

1. Deploy ke production
2. Update environment variables di hosting (Netlify/Vercel)
3. Test dari website live
4. Monitor notifikasi masuk

## 🎯 Production Deployment

### Netlify

```bash
# Dashboard > Site Settings > Environment Variables
# Tambahkan:
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
# atau
DISCORD_WEBHOOK_URL=...
```

### Vercel

```bash
# Settings > Environment Variables
# Tambahkan variable yang sama
```

## 💡 Tips

- Gunakan Telegram untuk notifikasi mobile
- Discord bagus untuk team collaboration
- Bisa aktifkan keduanya sekaligus
- Test dulu di development sebelum production

---

**Need help?** Cek dokumentasi lengkap di `docs/NEWSLETTER_NOTIFICATION.md`
