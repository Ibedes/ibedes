# Integrasi Notifikasi Like & Comment

Panduan untuk mengintegrasikan notifikasi like dan comment ke FloatingReactions.astro

## 📝 Langkah-langkah

### 1. Import Helper di FloatingReactions.astro

Tambahkan import di bagian script:

```javascript
import { notifyLike, notifyComment } from '../../lib/admin-notifications-client';
```

### 2. Kirim Notifikasi Saat Like

Cari bagian kode yang handle like button click, lalu tambahkan:

```javascript
// Setelah like berhasil
likesState = {
  ...likesState,
  count: likesState.count + 1,
  claps: Math.min(MAX_CLAPS, likesState.claps + 1),
};
persistLikes();
updateLikeUI();

// TAMBAHKAN INI: Kirim notifikasi ke admin
if (typeof window !== 'undefined') {
  const articleSlug = window.location.pathname.replace('/blog/', '');
  const articleTitle = document.title.replace(' - ibedes', '');
  
  // Import function di global scope atau gunakan dynamic import
  import('../../lib/admin-notifications-client').then(({ notifyLike }) => {
    notifyLike(articleSlug, articleTitle);
  });
}
```

### 3. Kirim Notifikasi Saat Comment

Cari bagian kode yang handle comment submit, lalu tambahkan:

```javascript
// Setelah comment berhasil di-submit
const commentText = commentInput.value;

// Submit comment logic here...

// TAMBAHKAN INI: Kirim notifikasi ke admin
if (typeof window !== 'undefined') {
  const articleSlug = window.location.pathname.replace('/blog/', '');
  const articleTitle = document.title.replace(' - ibedes', '');
  
  import('../../lib/admin-notifications-client').then(({ notifyComment }) => {
    notifyComment(articleSlug, articleTitle, commentText);
  });
}
```

## 🎯 Contoh Implementasi Lengkap

### Untuk Like Button

```javascript
likeButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const reachedLimit = likesState.claps >= MAX_CLAPS;
    if (reachedLimit) return;

    // Update state
    likesState = {
      ...likesState,
      count: likesState.count + 1,
      claps: Math.min(MAX_CLAPS, likesState.claps + 1),
    };
    
    persistLikes();
    updateLikeUI();

    // Kirim ke analytics
    if (useRemote) {
      await sendLikeToSupabase();
    }

    // ✨ NOTIFIKASI ADMIN
    try {
      const articleSlug = window.location.pathname.replace('/blog/', '').replace('/', '');
      const articleTitle = document.querySelector('h1')?.textContent || document.title;
      
      const { notifyLike } = await import('../../lib/admin-notifications-client');
      notifyLike(articleSlug, articleTitle);
    } catch (error) {
      console.warn('Failed to send admin notification:', error);
    }
  });
});
```

### Untuk Comment Submit

```javascript
commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const commentText = commentInput.value.trim();
  if (!commentText) return;

  // Submit comment logic
  const comment = {
    text: commentText,
    timestamp: new Date().toISOString(),
    userHash: getUserHash(),
  };

  // Save to database/storage
  await saveComment(comment);

  // Update UI
  displayComment(comment);
  commentInput.value = '';

  // ✨ NOTIFIKASI ADMIN
  try {
    const articleSlug = window.location.pathname.replace('/blog/', '').replace('/', '');
    const articleTitle = document.querySelector('h1')?.textContent || document.title;
    
    const { notifyComment } = await import('../../lib/admin-notifications-client');
    notifyComment(articleSlug, articleTitle, commentText);
  } catch (error) {
    console.warn('Failed to send admin notification:', error);
  }
});
```

## 🔍 Debugging

### Test Notifikasi

Tambahkan di browser console saat berada di halaman artikel:

```javascript
// Test like notification
import('../../lib/admin-notifications-client').then(({ notifyLike }) => {
  notifyLike('test-article', 'Test Article Title');
});

// Test comment notification
import('../../lib/admin-notifications-client').then(({ notifyComment }) => {
  notifyComment('test-article', 'Test Article Title', 'This is a test comment');
});
```

### Cek Event

```javascript
// Listen untuk notification events
window.addEventListener('notification:new', (e) => {
  console.log('New notification:', e.detail);
});
```

## ⚠️ Important Notes

1. **Dynamic Import**: Gunakan dynamic import untuk avoid bundling issues
2. **Error Handling**: Wrap dalam try-catch agar tidak break functionality
3. **Article Info**: Pastikan articleSlug dan articleTitle benar
4. **Debouncing**: Untuk like, consider debounce agar tidak spam notifikasi

## 🎨 Optional: Debounce untuk Like

Jika user spam click like button:

```javascript
let likeNotificationTimeout;

function sendLikeNotification(articleSlug, articleTitle) {
  // Clear previous timeout
  clearTimeout(likeNotificationTimeout);
  
  // Set new timeout (only send after 2 seconds of no activity)
  likeNotificationTimeout = setTimeout(async () => {
    try {
      const { notifyLike } = await import('../../lib/admin-notifications-client');
      notifyLike(articleSlug, articleTitle);
    } catch (error) {
      console.warn('Failed to send admin notification:', error);
    }
  }, 2000);
}
```

## ✅ Checklist

- [ ] Import helper di FloatingReactions.astro
- [ ] Tambahkan notifyLike() di like button handler
- [ ] Tambahkan notifyComment() di comment submit handler
- [ ] Test like notification
- [ ] Test comment notification
- [ ] Cek dashboard untuk notifikasi masuk
- [ ] Verify data accuracy (slug, title, text)

---

**Note**: File FloatingReactions.astro cukup kompleks. Jika butuh bantuan untuk integrasi, bisa minta bantuan untuk edit file tersebut.
