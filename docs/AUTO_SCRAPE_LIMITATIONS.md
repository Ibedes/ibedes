# Auto-Scrape Feature - Platform Status & Notes

## ✅ **Platform Status**

| Platform | Status | Title | Image | Description | Price | Notes |
|----------|--------|-------|-------|-------------|-------|-------|
| **Shopee** | ✅ **Supported** | ✅ | ✅ | ✅ | ⚠️ | Price extraction might be inaccurate |
| **Tokopedia** | ✅ **Supported** | ✅ | ✅ | ✅ | ⚠️ | Price extraction might be inaccurate |
| **TikTok Shop** | ✅ **Supported** | ✅ | ✅ | ✅ | ⚠️ | Price extraction might be inaccurate |

---

## 🔧 **Technical Details**

### **How it Works**
1. **Redirect Following:** The scraper follows redirects (crucial for short URLs like `s.shopee.co.id` and `vt.tokopedia.com`).
2. **Bot User-Agent:** Uses `WhatsApp/2.21.12.21 A` User-Agent which is whitelisted by most marketplaces to allow link previews.
3. **Smart Extraction:**
   - Extracts standard Open Graph tags (`og:title`, `og:image`, `og:description`).
   - Parses JSON-LD and custom JSON structures (like `RENDER_DATA` for TikTok/Tokopedia) to find prices.

### **Known Limitations**
1. **Price Accuracy:** 
   - Prices are sometimes embedded in complex JSON structures or rendered via JavaScript in a way that's hard to parse reliably with regex.
   - **Workaround:** Always check the auto-filled price and correct it manually if needed.
2. **TikTok Shop/Tokopedia Integration:**
   - Tokopedia links often redirect to TikTok Shop infrastructure (`shop-id.tokopedia.com`). The scraper handles this automatically.

---

## 💡 **Troubleshooting**

### **If Scrape Fails:**
1. **Check URL:** Ensure the link opens correctly in a browser (incognito mode).
2. **Manual Input:** If auto-scrape fails completely, use the manual input method:
   - Copy Title, Image URL, and Price manually.
   - The Affiliate Link will still be auto-filled.

### **If Price is Wrong:**
- This is expected behavior for some product pages.
- Simply edit the price field manually before saving.

---

**Last Updated:** 2025-12-05
**Status:** ✅ Fully Operational
