# Arsitektur Sistem Notifikasi

## Diagram Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FloatingReactions.astro (Client-Side)                               │
│  ┌──────────────┐          ┌──────────────┐                         │
│  │ Like Button  │          │Comment Button│                         │
│  └──────┬───────┘          └──────┬───────┘                         │
│         │                         │                                  │
│         └─────────┬───────────────┘                                  │
└───────────────────┼──────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                                 │
│  ┌──────────────────┐      ┌──────────────────┐                    │
│  │ article_likes    │      │ article_comments │                    │
│  │ ┌──────────────┐ │      │ ┌──────────────┐ │                    │
│  │ │ INSERT       │ │      │ │ INSERT       │ │                    │
│  │ └──────┬───────┘ │      │ └──────┬───────┘ │                    │
│  └────────┼─────────┘      └────────┼─────────┘                    │
│           │                         │                                │
│           │  ┌──────────────────────┘                                │
│           │  │                                                       │
│           ▼  ▼                                                       │
│  ┌─────────────────────────────────────┐                           │
│  │  TRIGGERS (Auto-Execute)             │                           │
│  │  ┌────────────────────────────────┐  │                           │
│  │  │ on_article_like_insert         │  │                           │
│  │  │ → notify_new_like()            │  │                           │
│  │  └────────────────────────────────┘  │                           │
│  │  ┌────────────────────────────────┐  │                           │
│  │  │ on_article_comment_insert      │  │                           │
│  │  │ → notify_new_comment()         │  │                           │
│  │  └────────────────────────────────┘  │                           │
│  └──────────────────┬──────────────────┘                           │
│                     │                                                │
│                     ▼                                                │
│  ┌─────────────────────────────────────┐                           │
│  │  notifications (Table)               │                           │
│  │  ┌────────────────────────────────┐  │                           │
│  │  │ INSERT new notification        │  │                           │
│  │  │ - type: 'like' / 'comment'     │  │                           │
│  │  │ - title: '❤️ Like Baru'        │  │                           │
│  │  │ - message: 'Artikel X...'      │  │                           │
│  │  │ - metadata: {...}              │  │                           │
│  │  │ - read: false                  │  │                           │
│  │  └────────────────────────────────┘  │                           │
│  └─────────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────┘
                    │
                    │ (Polling every 10s)
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  API: /api/admin/notifications (Server-Side)                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ GET  → Fetch notifications from Supabase                     │  │
│  │ POST → Create notification manually                          │  │
│  │ PATCH → Mark as read                                         │  │
│  │ DELETE → Delete notification                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  NotificationBell.astro (Client-Side - Admin Only)                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🔔 Bell Icon                                                  │  │
│  │ ┌─────────┐                                                   │  │
│  │ │ Badge: 5│  ← Unread count                                  │  │
│  │ └─────────┘                                                   │  │
│  │                                                                │  │
│  │ [Click] → Open Dropdown Panel                                │  │
│  │ ┌────────────────────────────────────────────────────────┐   │  │
│  │ │ Filters: [All] [Newsletter] [Like] [Comment]           │   │  │
│  │ ├────────────────────────────────────────────────────────┤   │  │
│  │ │ ❤️ Like Baru                                           │   │  │
│  │ │ Artikel "My Article" mendapat like                     │   │  │
│  │ │ 5 menit lalu                                [x]         │   │  │
│  │ ├────────────────────────────────────────────────────────┤   │  │
│  │ │ 💬 Komentar Baru                                       │   │  │
│  │ │ Komentar baru di "Another Article"                     │   │  │
│  │ │ 10 menit lalu                               [x]         │   │  │
│  │ └────────────────────────────────────────────────────────┘   │  │
│  │                                                                │  │
│  │ Actions: [Mark All Read] [Clear All]                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
Header.astro
├── isAdminPage = currentPath.startsWith('/admin')
└── NotificationBell.astro (isAdmin={isAdminPage})
    ├── if (!isAdmin) return null  ← KEY: Only render in admin
    ├── Bell Icon + Badge
    ├── Dropdown Panel
    │   ├── Filter Chips
    │   ├── Notification List
    │   └── Action Buttons
    └── Script
        ├── loadNotifications() → API call
        ├── Polling (10s interval)
        ├── Event Listeners
        └── UI Updates
```

## Data Flow

### 1. Creating Notification (Automatic via Trigger)

```
User clicks Like
    ↓
FloatingReactions.astro
    ↓
fetch(supabaseUrl + '/rest/v1/article_likes', {
    method: 'POST',
    body: { slug, user_hash }
})
    ↓
Supabase: INSERT INTO article_likes
    ↓
Trigger: on_article_like_insert
    ↓
Function: notify_new_like()
    ↓
INSERT INTO notifications {
    type: 'like',
    title: '❤️ Like Baru',
    message: 'Artikel "..." mendapat like',
    metadata: { articleSlug, articleTitle, userHash },
    read: false
}
```

### 2. Displaying Notification (Polling)

```
NotificationBell.astro (in /admin/dashboard)
    ↓
Every 10 seconds:
    ↓
loadAndDisplay()
    ↓
fetch('/api/admin/notifications')
    ↓
API: GET /api/admin/notifications
    ↓
supabase.from('notifications').select('*')
    ↓
Return { notifications: [...], unreadCount: 5 }
    ↓
updateBadge(5)
    ↓
renderNotifications([...])
    ↓
UI updates with new notifications
```

### 3. Marking as Read

```
User clicks notification
    ↓
markAsRead(notificationId)
    ↓
Try Supabase first:
    supabase.from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
    ↓
If success: return
    ↓
If fail: fallback to localStorage
    ↓
loadAndDisplay() → refresh UI
```

## File Structure

```
ibedes/
├── src/
│   ├── components/
│   │   ├── NotificationBell.astro      ← UI Component (admin only)
│   │   ├── FloatingReactions.astro     ← Like/Comment UI
│   │   └── Header.astro                ← Detects admin page
│   │
│   ├── lib/
│   │   ├── notifications.ts            ← Core logic (Supabase + localStorage)
│   │   └── admin-notifications-client.ts ← Helper functions
│   │
│   └── pages/
│       └── api/
│           └── admin/
│               └── notifications.ts    ← API endpoint (GET/POST/PATCH/DELETE)
│
├── supabase_setup_complete.sql         ← Master setup file
├── supabase_engagement_tables.sql      ← article_likes, article_comments
├── supabase_notifications.sql          ← notifications table
├── supabase_triggers.sql               ← Auto-notification triggers
│
├── NOTIFICATION_QUICKSTART.md          ← Quick setup guide
├── NOTIFICATION_SETUP.md               ← Full documentation
├── CHANGELOG_NOTIFICATIONS.md          ← Summary of changes
└── ARCHITECTURE_NOTIFICATIONS.md       ← This file
```

## Key Features

### 1. Admin-Only Visibility
```typescript
// Header.astro
const isAdminPage = currentPath.startsWith('/admin');

// NotificationBell.astro
if (!isAdmin) return null;
```

### 2. Automatic Notifications
```sql
-- Trigger automatically creates notification
CREATE TRIGGER on_article_like_insert
    AFTER INSERT ON article_likes
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_like();
```

### 3. Dual Storage (Supabase + localStorage)
```typescript
// Try Supabase first
const { data } = await supabase.from('notifications').select('*');

// Fallback to localStorage if Supabase fails
const stored = localStorage.getItem('ibedes:admin:notifications');
```

### 4. Real-time Updates
```typescript
// Polling every 10 seconds
setInterval(async () => {
    await this.loadAndDisplay();
}, 10000);

// Optional: Supabase Realtime
channel.on('postgres_changes', { ... }, (payload) => {
    this.loadAndDisplay();
});
```

## Security

### Row Level Security (RLS)

```sql
-- notifications table
CREATE POLICY "Admin can manage notifications"
    ON notifications FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Anonymous can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anonymous can read notifications"
    ON notifications FOR SELECT
    USING (true);
```

### API Protection

```typescript
// In production, add authentication check
export const GET: APIRoute = async ({ request }) => {
    // TODO: Add admin authentication
    // const session = await getSession(request);
    // if (!session?.user?.isAdmin) return 401;
    
    // ... fetch notifications
};
```

## Performance Optimization

### 1. Indexes
```sql
CREATE INDEX idx_notifications_timestamp ON notifications(timestamp DESC);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_type ON notifications(type);
```

### 2. Limit Results
```typescript
// Only fetch latest 100 notifications
.limit(100)

// Only show 20 in UI
.slice(0, 20)
```

### 3. Polling Interval
```typescript
// Adjust based on needs
const POLL_INTERVAL = 10000; // 10 seconds (default)
// For less traffic: 30000 (30 seconds)
// For real-time: Use Supabase Realtime instead
```

## Future Enhancements

1. **Push Notifications** - Browser push API
2. **Email Notifications** - Send email for important events
3. **Notification Preferences** - User can choose which notifications to receive
4. **Notification Groups** - Group similar notifications
5. **Sound Alerts** - Audio notification for new items
6. **Desktop Notifications** - System notifications

---

**Last Updated:** 2025-12-02
**Version:** 1.0.0
