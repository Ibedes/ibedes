# 🚀 Quick Reference Card - Enhancement ibedes.xyz

## 📦 Komponen yang Tersedia

### Toast Notification
```astro
import Toast from '@/components/common/Toast.astro';
<Toast position="bottom-right" />
```
```javascript
window.showToast('Message', { type: 'success' }); // success, error, info, warning
```

### Skeleton Loader
```astro
import SkeletonLoader from '@/components/common/SkeletonLoader.astro';
<SkeletonLoader variant="product" count={3} /> // card, product, article, text, circle
```

### Breadcrumb
```astro
import Breadcrumb from '@/components/common/Breadcrumb.astro';
<Breadcrumb items={[{ name: 'Home', url: '/' }]} />
```

### Optimized Image
```astro
import OptimizedImage from '@/components/common/OptimizedImage.astro';
<OptimizedImage src={img} alt="..." width={800} height={600} loading="lazy" />
```

---

## 🛠️ Utility Functions

### SEO
```typescript
import { generateArticleSchema, generateProductSchema, generateSocialMeta } from '@/lib/seo';

const articleSchema = generateArticleSchema({ title, description, publishedTime, author, url }, siteUrl);
const productSchema = generateProductSchema({ name, image, price, rating, url }, siteUrl);
const socialMeta = generateSocialMeta(title, description, image, url, 'article');
```

### Analytics
```typescript
import { trackAffiliateClick, trackShare, initScrollTracking, initTimeTracking } from '@/lib/analytics';

trackAffiliateClick(productId, platform, name, price);
trackShare(platform, url, title);
initScrollTracking();
initTimeTracking();
```

### Performance
```typescript
import { initAllPerformanceMonitoring } from '@/lib/performance';
initAllPerformanceMonitoring();
```

---

## 📋 Common Patterns

### Layout Setup
```astro
---
import Toast from '@/components/common/Toast.astro';
---
<body>
  <slot />
  <Toast position="bottom-right" />
  <script>
    import { initScrollTracking, initTimeTracking } from '@/lib/analytics';
    import { initAllPerformanceMonitoring } from '@/lib/performance';
    window.addEventListener('load', () => {
      initScrollTracking();
      initTimeTracking();
      initAllPerformanceMonitoring();
    });
  </script>
</body>
```

### Article Page
```astro
---
import Breadcrumb from '@/components/common/Breadcrumb.astro';
import { generateArticleSchema } from '@/lib/seo';

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Blog', url: '/blog' },
  { name: article.title, url: Astro.url.pathname }
];

const schema = generateArticleSchema({
  title: article.title,
  description: article.description,
  publishedTime: article.date,
  author: 'ibedes',
  url: Astro.url.pathname
}, 'https://ibedes.xyz');
---

<Breadcrumb items={breadcrumbs} />
<!-- Content -->
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

### Loading State
```astro
{loading ? (
  <SkeletonLoader variant="product" count={3} />
) : (
  <ProductList products={products} />
)}
```

### User Feedback
```javascript
// Success
window.showToast('Berhasil!', { type: 'success' });

// Error
window.showToast('Gagal!', { type: 'error' });

// Info
window.showToast('Info penting', { type: 'info' });

// Warning
window.showToast('Perhatian!', { type: 'warning' });
```

---

## 📊 Analytics Events

| Event | Function | Parameters |
|-------|----------|------------|
| Affiliate Click | `trackAffiliateClick()` | id, platform, name, price |
| Share | `trackShare()` | platform, url, title |
| Newsletter | `trackNewsletterSubscribe()` | email |
| Page View | `trackPageView()` | path, title, metadata |
| Engagement | `trackEngagement()` | action, value, label |
| Error | `trackError()` | error, context |

---

## 🔍 SEO Schema Types

| Type | Function | Use Case |
|------|----------|----------|
| Article | `generateArticleSchema()` | Blog posts, articles |
| Product | `generateProductSchema()` | Affiliate products |
| Breadcrumb | `generateBreadcrumbSchema()` | Navigation |
| Website | `generateWebsiteSchema()` | Homepage, main pages |
| Person | `generatePersonSchema()` | Author pages |

---

## 🧪 Testing Commands

### Rich Results Test
```
https://search.google.com/test/rich-results
```

### Facebook Debugger
```
https://developers.facebook.com/tools/debug/
```

### Twitter Card Validator
```
https://cards-dev.twitter.com/validator
```

### Lighthouse
```bash
npm run build
npm run preview
# Then run Lighthouse in DevTools
```

---

## 📁 File Locations

```
src/
├── components/common/
│   ├── Toast.astro
│   ├── SkeletonLoader.astro
│   ├── Breadcrumb.astro
│   └── OptimizedImage.astro
├── lib/
│   ├── seo.ts
│   ├── analytics.ts
│   └── performance.ts
└── components/
    ├── AffiliateProducts.astro (enhanced)
    └── ShareActions.astro (enhanced)

examples/
├── BaseLayout-enhanced.astro
├── blog-index-enhanced.astro
└── article-page-enhanced.astro

Documentation/
├── ENHANCEMENTS.md
├── ENHANCEMENT_SUMMARY.md
├── IMPLEMENTATION_CHECKLIST.md
└── FINAL_SUMMARY.md
```

---

## 🎯 Priority Implementation Order

1. **High** - Add Toast to layout
2. **High** - Initialize analytics
3. **High** - Add structured data to articles
4. **Medium** - Add breadcrumbs
5. **Medium** - Use OptimizedImage
6. **Low** - Add skeleton loaders

---

## 💡 Quick Tips

- Always test in development first
- Use skeleton loaders for async content
- Add structured data to all important pages
- Monitor analytics regularly
- Optimize images (lazy loading, WebP)
- Provide user feedback for all actions

---

## 📞 Quick Links

- [Full Docs](./ENHANCEMENTS.md)
- [Summary](./ENHANCEMENT_SUMMARY.md)
- [Checklist](./IMPLEMENTATION_CHECKLIST.md)
- [Examples](./examples/README.md)

---

**Print this card for quick reference! 📄**
