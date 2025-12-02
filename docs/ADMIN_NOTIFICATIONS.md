# 🔔 Sistem Notifikasi Admin Dashboard

Sistem notifikasi terpadu untuk admin dashboard yang menampilkan semua interaksi pengguna secara real-time.

## ✨ Fitur

- ✅ **Newsletter Subscribers** - Notifikasi saat ada subscriber baru
- ✅ **Article Likes** - Notifikasi saat artikel mendapat like
- ✅ **Comments** - Notifikasi saat ada komentar baru
- ✅ **Bookmarks** - Notifikasi saat artikel di-bookmark
- ✅ **Real-time Updates** - Notifikasi muncul langsung tanpa refresh
- ✅ **Filter by Type** - Filter notifikasi berdasarkan jenis
- ✅ **Mark as Read** - Tandai notifikasi sudah dibaca
- ✅ **Delete** - Hapus notifikasi individual atau semua
- ✅ **Toast Notifications** - Pop-up notifikasi untuk event baru
- ✅ **Persistent Storage** - Notifikasi tersimpan di localStorage
- ✅ **Unread Counter** - Badge untuk notifikasi yang belum dibaca

## 📦 Komponen

### 1. UnifiedNotifications.astro
Komponen utama yang menampilkan semua notifikasi di dashboard.

**Lokasi**: `src/components/admin/UnifiedNotifications.astro`

**Features**:
- Display all notification types
- Filter by type (All, Newsletter, Like, Comment)
- Mark as read/unread
- Delete individual or all notifications
- Real-time updates via custom events
- Toast notifications for new events

### 2. Notification Library
Library untuk mengelola notifikasi.

**Lokasi**: `src/lib/notifications.ts`

**Functions**:
```typescript
// Load notifications
loadNotifications(): NotificationStore

// Add new notification
addNotification(notification): Notification

// Mark as read
markAsRead(notificationId: string): void
markAllAsRead(): void

// Delete notifications
deleteNotification(notificationId: string): void
clearAllNotifications(): void

// Get filtered notifications
getNotificationsByType(type: NotificationType): Notification[]
getUnreadNotifications(): Notification[]

// Format notification
formatNotification(type, metadata): Notification
```

### 3. Client Helper
Helper untuk mengirim notifikasi dari komponen client-side.

**Lokasi**: `src/lib/admin-notifications-client.ts`

**Functions**:
```typescript
// Send notification
sendAdminNotification(payload: NotificationPayload): void

// Specific helpers
notifyLike(articleSlug, articleTitle): void
notifyComment(articleSlug, articleTitle, commentText): void
notifyBookmark(articleSlug, articleTitle): void
```

## 🚀 Cara Pakai

### Di Dashboard

Dashboard sudah otomatis menampilkan komponen `UnifiedNotifications`:

```astro
<!-- src/pages/admin/dashboard.astro -->
<UnifiedNotifications />
```

### Mengirim Notifikasi Newsletter

Sudah terintegrasi otomatis di `SubscribeCard.astro`:

```javascript
// Otomatis dispatch event saat subscribe berhasil
window.dispatchEvent(new CustomEvent('notification:new', {
  detail: {
    type: 'newsletter',
    metadata: {
      email: email,
      source: window.location.pathname,
    }
  }
}));
```

### Mengirim Notifikasi Like

Tambahkan di komponen yang handle like (misal: `FloatingReactions.astro`):

```javascript
import { notifyLike } from '../../lib/admin-notifications-client';

// Saat user like artikel
notifyLike(articleSlug, articleTitle);
```

### Mengirim Notifikasi Comment

Tambahkan di komponen yang handle comment:

```javascript
import { notifyComment } from '../../lib/admin-notifications-client';

// Saat user submit comment
notifyComment(articleSlug, articleTitle, commentText);
```

### Custom Notification

Untuk notifikasi custom:

```javascript
import { sendAdminNotification } from '../../lib/admin-notifications-client';

sendAdminNotification({
  type: 'custom',
  metadata: {
    // your custom data
  }
});
```

## 📊 Data Structure

### Notification Object

```typescript
interface Notification {
  id: string;                    // Unique ID
  type: NotificationType;        // 'newsletter' | 'like' | 'comment' | 'bookmark'
  title: string;                 // Notification title
  message: string;               // Notification message
  metadata?: {                   // Additional data
    email?: string;
    articleSlug?: string;
    articleTitle?: string;
    commentText?: string;
    userHash?: string;
    source?: string;
  };
  timestamp: string;             // ISO timestamp
  read: boolean;                 // Read status
}
```

### NotificationStore

```typescript
interface NotificationStore {
  notifications: Notification[];  // Array of notifications
  unreadCount: number;           // Count of unread notifications
}
```

## 🎨 Customization

### Mengubah Warna Notifikasi

Edit di `UnifiedNotifications.astro`:

```javascript
getNotificationColor(type: NotificationType): string {
  const colors = {
    newsletter: '#10b981',  // Green
    like: '#ef4444',        // Red
    comment: '#3b82f6',     // Blue
    bookmark: '#f59e0b',    // Orange
  };
  return colors[type] || '#6b7280';
}
```

### Mengubah Icon

```javascript
getNotificationIcon(type: NotificationType): string {
  const icons = {
    newsletter: 'fa-solid fa-envelope',
    like: 'fa-solid fa-heart',
    comment: 'fa-solid fa-comment',
    bookmark: 'fa-solid fa-bookmark',
  };
  return icons[type] || 'fa-solid fa-bell';
}
```

### Mengubah Max Notifications

Edit di `src/lib/notifications.ts`:

```typescript
const MAX_NOTIFICATIONS = 100; // Ubah sesuai kebutuhan
```

## 🔄 Flow Diagram

```
User Action (Subscribe/Like/Comment)
         ↓
Component mengirim event
         ↓
window.dispatchEvent('notification:new')
         ↓
UnifiedNotifications menangkap event
         ↓
addNotification() → Save to localStorage
         ↓
Update UI + Show Toast
         ↓
Admin melihat notifikasi di dashboard
```

## 💾 Storage

Notifikasi disimpan di **localStorage** dengan key:
```
ibedes:admin:notifications
```

Data structure:
```json
{
  "notifications": [...],
  "unreadCount": 5
}
```

## 🎯 Best Practices

1. **Jangan spam notifikasi** - Gunakan debounce untuk aksi yang sering terjadi
2. **Limit data size** - Truncate text panjang (misal: comment)
3. **Clean up old notifications** - Sistem otomatis limit ke 100 notifikasi terbaru
4. **Test di incognito** - Pastikan notifikasi bekerja tanpa cache
5. **Monitor localStorage size** - Jangan sampai penuh

## 🐛 Troubleshooting

### Notifikasi tidak muncul?

1. **Cek console** untuk error messages
2. **Cek localStorage**:
   ```javascript
   console.log(localStorage.getItem('ibedes:admin:notifications'));
   ```
3. **Cek event listener**:
   ```javascript
   window.addEventListener('notification:new', (e) => {
     console.log('Notification event:', e.detail);
   });
   ```

### Notifikasi hilang setelah refresh?

- Ini normal jika localStorage di-clear
- Pastikan tidak ada script yang clear localStorage
- Cek browser settings (private mode akan clear localStorage)

### Toast tidak muncul?

- Cek z-index di CSS
- Pastikan tidak ada element yang overlap
- Cek browser console untuk JavaScript errors

## 📱 Mobile Support

Komponen sudah responsive untuk mobile:
- Filter buttons menjadi icon-only
- Toast notification menyesuaikan lebar layar
- Touch-friendly button sizes

## 🔐 Security

- Email di-mask untuk privacy: `u***r@domain.com`
- User hash digunakan instead of identifiable data
- No sensitive data di localStorage
- XSS protection dengan escapeHtml()

## 🚀 Future Enhancements

- [ ] Server-side persistence (database)
- [ ] Server-Sent Events untuk real-time sync
- [ ] Push notifications (browser API)
- [ ] Email digest untuk notifikasi
- [ ] Export notifications ke CSV
- [ ] Notification preferences/settings
- [ ] Notification sound
- [ ] Desktop notifications

## 📚 Related Files

- `src/components/admin/UnifiedNotifications.astro` - Main component
- `src/lib/notifications.ts` - Notification management library
- `src/lib/admin-notifications-client.ts` - Client helper
- `src/pages/api/admin/notifications.ts` - API endpoint
- `src/components/SubscribeCard.astro` - Newsletter integration
- `src/pages/admin/dashboard.astro` - Dashboard integration

---

**Created for ibedes.xyz** | Last updated: 2025-12-01
