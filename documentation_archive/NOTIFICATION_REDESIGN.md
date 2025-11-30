# 📬 Redesain Notifikasi Admin Dashboard

## 🎯 Overview

Notifikasi di halaman admin telah dirancang ulang dengan desain yang **lebih rapih, berwarna-warni, dan menyenangkan**. Perubahan ini mencakup visual design yang modern, animasi smooth, dan better user experience.

## ✨ Fitur Utama

### 1. **Color-Coded Notification Types**
Setiap tipe notifikasi memiliki warna dan ikon unik:

- 💖 **Love** - Pink (#ff6b9a)
  - Digunakan ketika pembaca memberikan love/like pada artikel
  - Icon: Heart dengan gradient pink

- 💬 **Komentar** - Ungu (#4f46e5)
  - Digunakan untuk komentar baru dari pembaca
  - Icon: Comment dengan gradient purple

- 📧 **Pesan** - Hijau (#10b981)
  - Digunakan untuk pesan/inbox dari pembaca atau sistem
  - Icon: Envelope dengan gradient green

- ⚙️ **Sistem** - Orange (#f59e0b)
  - Untuk notifikasi sistem penting
  - Icon: Gear dengan gradient orange

### 2. **Responsive Grid Layout**
- Desktop: 3 kolom responsive dengan auto-fit
- Tablet: Menyesuaikan dengan ukuran layar
- Mobile: 1 kolom full-width

### 3. **Smooth Animations**
- **Slide Up**: Card muncul dengan animasi slide-up saat dimuat
- **Float**: Empty state icon bergerak halus (breathing effect)
- **Pulse**: Dot indicator pada unread notification berdenyut
- **Hover**: Card naik dan shadow membesar pada hover
- **Arrow**: Arrow icon bergerak saat hover action button

### 4. **Visual Indicators**
- **Unread Status**: Animated pulse dot di corner kanan atas
- **Badge**: Type indicator dengan icon & text
- **Meta Info**: Status dan waktu notifikasi
- **Action Button**: Tombol untuk interact dengan notifikasi

## 📁 File yang Dimodifikasi

### 1. `/src/pages/admin/dashboard.astro`
- Updated HTML structure untuk notifikasi section
- Replaced old `.admin-notifications-grid` dengan `.admin-notifications-grid-new`
- Replaced old `.admin-empty-state` dengan `.admin-empty-state-new`
- Added comprehensive CSS styles untuk semua notification variations

**Key Classes:**
- `.admin-notifications-grid-new` - Container grid
- `.admin-notification-card-new` - Card main container
- `.admin-notification-card-new__header` - Card header
- `.admin-notification-card-new__icon-box` - Icon container
- `.admin-notification-card-new__badge` - Type badge
- `.admin-notification-card-new__title` - Notification title
- `.admin-notification-card-new__message` - Notification message
- `.admin-notification-card-new__action` - Action button
- `.admin-empty-state-new` - Empty state container

### 2. `/src/components/admin/NotificationCard.astro` (NEW)
Component siap pakai untuk render individual notification cards.

**Props:**
```typescript
interface Props {
  type?: "like" | "comment" | "message" | "system";
  title: string;
  message: string;
  time: string;
  status?: "read" | "unread";
  icon: string;
  action?: {
    label: string;
    href: string;
  };
}
```

**Usage:**
```astro
<NotificationCard
  type="like"
  title="Artikel Kamu Dicintai!"
  message="Seseorang memberikan love pada artikel Anda"
  time="2 menit lalu"
  status="unread"
  icon="fa-solid fa-heart"
  action={{
    label: "Lihat",
    href: "/blog/artikel"
  }}
/>
```

## 🎨 Design Sistem

### Color Palette

```css
/* Type Colors */
--color-like: #ff6b9a;      /* Pink */
--color-comment: #4f46e5;   /* Purple/Indigo */
--color-message: #10b981;   /* Green */
--color-system: #f59e0b;    /* Amber/Orange */
```

### Typography

- **Title**: Font-family display, 1.125rem, weight 700
- **Message**: 0.9375rem, weight 400, line-height 1.6
- **Badge**: 0.75rem, weight 700, uppercase
- **Time**: 0.8125rem, weight 500, muted color

### Spacing

- **Card Padding**: 1.5rem
- **Gap Between Elements**: 1rem
- **Border Radius**: 14px (card), 12px (icon box)

### Shadows

```css
/* Default Shadow */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3), 
            inset 0 1px 0 rgba(255, 255, 255, 0.1);

/* Hover Shadow */
box-shadow: 0 20px 25px -5px rgba(color, 0.3),
            0 10px 10px -5px rgba(color, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
```

## 📱 Responsive Breakpoints

### Desktop (768px+)
- Grid: 3 kolom
- Card padding: 1.5rem
- Icon size: 3rem × 3rem

### Tablet (480px - 768px)
- Grid: 1 kolom full-width
- Card padding: 1.25rem
- Icon size: 2.75rem × 2.75rem
- Footer flex direction: column

### Mobile (<480px)
- Grid: 1 kolom
- Card padding: 1rem
- Icon size: 2.5rem × 2.5rem
- Empty state padding: 2.5rem 1.5rem

## 🔧 Implementasi

### Untuk menampilkan notifikasi:

```astro
<div class="admin-notifications-grid-new" data-admin-notifications>
  {notifications.map(notif => (
    <NotificationCard
      type={notif.type}
      title={notif.title}
      message={notif.message}
      time={formatTime(notif.timestamp)}
      status={notif.read ? "read" : "unread"}
      icon={getNotificationIcon(notif.type)}
      action={notif.action}
    />
  ))}
</div>
```

### Data Structure:

```typescript
interface Notification {
  id: string;
  type: "like" | "comment" | "message" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: string;
  action?: {
    label: string;
    href: string;
  };
}
```

## 🎬 Animasi Tersedia

### 1. Slide Up
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```
- Duration: 400ms
- Staggered delay untuk setiap card

### 2. Float (Empty State)
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
```
- Duration: 3s infinite
- Breathing effect

### 3. Pulse (Unread Indicator)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}
```
- Duration: 2s infinite
- Subtle indicator

## 🎯 Preview

Buka `/notification-preview.html` untuk melihat preview lengkap dari semua notification variations.

```bash
# Development
npm run dev
# Kunjungi: http://localhost:3000/notification-preview.html
```

## 📊 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Future Enhancements

- [ ] Real-time notification updates dengan Supabase
- [ ] Notification categorization & filtering
- [ ] Notification history/archive
- [ ] Push notifications
- [ ] Sound notifications (optional)
- [ ] Notification preferences panel

## 📝 Changelog

### Version 1.0.0
- Initial redesign dengan color-coded types
- Responsive grid layout
- Smooth animations
- Empty state design
- Component NotificationCard
- Mobile-friendly layout

---

**Last Updated**: November 30, 2024  
**Design Lead**: Admin Dashboard Redesign  
**Status**: ✅ Ready for Implementation
