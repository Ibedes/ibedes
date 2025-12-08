import { supabaseAdmin, hasSupabaseConfig } from "./supabase.ts";
import { getAffiliateClicksSummary } from "./analytics-store.ts";
import localProducts from "../data/affiliate-products.json" assert { type: "json" };

// Works both in Astro (import.meta.env) and direct Node execution (process.env)
const supabaseUrl = 
    import.meta.env?.PUBLIC_SUPABASE_URL || 
    (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_URL : "") || 
    "";
const supabaseServiceKey = 
    import.meta.env?.SUPABASE_SERVICE_ROLE_KEY || 
    (typeof process !== 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : "") || 
    "";

export interface AffiliateProduct {
    id: string;
    name: string;
    description: string;
    price?: string;
    originalPrice?: string;
    discount?: string;
    image: string;
    link: string;
    platform: 'shopee' | 'tokopedia' | 'lazada' | 'blibli' | 'tiktok' | 'amazon' | 'other';
    category: string;
    tags: string[];
    rating?: number;
    verified?: boolean;
    score?: number;
    clicks?: number;
}

export interface ArticleAffiliate {
    articleSlug: string;
    productIds: string[];
    context?: string;
}

// Helper to normalize Supabase response to AffiliateProduct
function normalizeProduct(data: any): AffiliateProduct {
    return {
        id: data.id,
        name: data.name,
        description: data.description || "",
        price: data.price ? String(data.price) : undefined,
        originalPrice: data.original_price ? String(data.original_price) : undefined,
        discount: data.discount || undefined,
        image: data.image || "",
        link: data.link || "",
        platform: data.platform as any || "other",
        category: data.category || "General",
        tags: data.tags || [],
        rating: data.rating || undefined,
        verified: data.verified || false,
    };
}

// In-memory cache so we don't hit Supabase on every request, but still refresh quickly
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cachedProducts: AffiliateProduct[] | null = null;
let cacheTimestamp = 0;

export async function loadAffiliateProducts(): Promise<AffiliateProduct[]> {
    console.log("[AffiliateStore] loadAffiliateProducts called");
    console.log("[AffiliateStore] hasSupabaseConfig:", hasSupabaseConfig);
    console.log("[AffiliateStore] supabaseAdmin available:", !!supabaseAdmin);
    console.log("[AffiliateStore] cachedProducts available:", !!cachedProducts);
    
    // Return cached products if available and not stale
    if (cachedProducts && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
        console.log("[AffiliateStore] Returning cached products:", cachedProducts.length);
        return cachedProducts;
    }
    
    // Always load local products first for debugging
    const local = (localProducts as AffiliateProduct[]).map((p) => ({
        ...p,
        id: String(p.id),
    }));
    console.log("[AffiliateStore] Local products loaded:", local.length);
    console.log("[AffiliateStore] Local product IDs:", local.map(p => p.id));
    
    // Local fallback for development/offline
    const useLocalFallback = !hasSupabaseConfig;

    if (useLocalFallback || !supabaseAdmin) {
        console.log("[AffiliateStore] Using local products only");
        cachedProducts = local;
        cacheTimestamp = Date.now();
        return local;
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('affiliate_products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("[Affiliate Store] Error loading products:", error);
            console.error("[Affiliate Store] Supabase URL:", supabaseUrl ? 'Set' : 'Not set');
            console.error("[Affiliate Store] Service Key:", supabaseServiceKey ? 'Set' : 'Not set');
            console.log("[Affiliate Store] Falling back to local products");
            cachedProducts = local;
            cacheTimestamp = Date.now();
            return local;
        }

        const normalized = (data || []).map(normalizeProduct);
        console.log("[Affiliate Store] Supabase returned:", normalized.length, "products");
        // If Supabase reachable but empty, fallback ke bundled dataset
        if (normalized.length === 0) {
            console.warn("[Affiliate Store] Supabase returned 0 products. Using local fallback dataset.");
            cachedProducts = local;
            cacheTimestamp = Date.now();
            return local;
        }

        // Penting: jika Supabase punya data, pakai data Supabase saja.
        // Menggabungkan dengan dataset lokal pernah membuat produk yang sudah dihapus muncul lagi,
        // karena item sample di bundle ikut dimunculkan ulang.
        cachedProducts = normalized;
        cacheTimestamp = Date.now();
        return normalized;
    } catch (error) {
        console.error("[Affiliate Store] Unexpected error loading products:", error);
        console.log("[Affiliate Store] Falling back to local products due to error");
        // Fallback to bundled dataset
        cachedProducts = local;
        cacheTimestamp = Date.now();
        return local;
    }
}

/**
 * Combine recency, click performance, and label verified
 * for dynamic recommendations.
 */
export async function loadAffiliateProductsRanked(options?: {
    days?: number;
    limit?: number;
    clickWeight?: number;
    recencyWeight?: number;
    verifiedBoost?: number;
}): Promise<AffiliateProduct[]> {
    const {
        days = 30,
        limit,
        clickWeight = 0.55,
        recencyWeight = 0.35,
        verifiedBoost = 0.1,
    } = options || {};

    const products = await loadAffiliateProducts();

    // Get aggregated clicks from analytics
    const clicksSummary = await getAffiliateClicksSummary(days, 500);
    const clickMap = new Map<string, number>();
    clicksSummary.forEach((item) => clickMap.set(item.productId, item.clicks));

    const maxClicks = Math.max(0, ...Array.from(clickMap.values()));
    const total = products.length || 1;

    const scored = products.map((product, idx) => {
        const clicks = clickMap.get(product.id) ?? 0;
        const clickScore = maxClicks > 0 ? clicks / maxClicks : 0;
        // Assuming products are ordered by created_at desc (newest first)
        // So higher index means older? No, loadAffiliateProducts orders by created_at desc.
        // So idx 0 is newest.
        // We want newest to have higher score.
        // (total - idx) / total gives 1 for idx 0, and near 0 for last idx.
        const recencyScore = (total - idx) / total;
        const verifiedScore = product.verified ? verifiedBoost : 0;
        const score = clickWeight * clickScore + recencyWeight * recencyScore + verifiedScore;

        return {
            ...product,
            clicks,
            score,
        };
    });

    const sorted = scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return typeof limit === "number" && limit > 0 ? sorted.slice(0, limit) : sorted;
}

// Mapping artikel dengan produk affiliate
export const articleAffiliates: ArticleAffiliate[] = [];

// Helper functions
export function getAffiliateByArticle(articleSlug: string): ArticleAffiliate | null {
    return articleAffiliates.find(aff => aff.articleSlug === articleSlug) || null;
}

export async function getAffiliateProductsByIds(productIds: string[]): Promise<AffiliateProduct[]> {
    if (!productIds.length) return [];

    console.log("[AffiliateStore] getAffiliateProductsByIds called with:", productIds);
    console.log("[AffiliateStore] hasSupabaseConfig:", hasSupabaseConfig);
    console.log("[AffiliateStore] supabaseAdmin available:", !!supabaseAdmin);

    // Fast-path fallback when Supabase isn't configured
    if (!supabaseAdmin || !hasSupabaseConfig) {
        console.log("[AffiliateStore] Using local fallback path");
        const all = await loadAffiliateProducts();
        console.log("[AffiliateStore] Loaded all products:", all.length);
        console.log("[AffiliateStore] Available product IDs:", all.map(p => p.id));
        const idSet = new Set(productIds.map((id) => String(id).trim()));
        console.log("[AffiliateStore] Looking for IDs:", Array.from(idSet));
        const filtered = all.filter((p) => {
            const match = idSet.has(String(p.id).trim());
            console.log("[AffiliateStore] Checking product", p.id, "against", idSet, "-> match:", match);
            return match;
        });
        console.log("[AffiliateStore] Filtered products:", filtered.length);
        console.log("[AffiliateStore] Filtered product IDs:", filtered.map(p => p.id));
        return filtered;
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('affiliate_products')
            .select('*')
            .in('id', productIds);

        if (error) {
            console.error("[Affiliate Store] Error fetching products by IDs:", error);
            console.warn("[Affiliate Store] Falling back to local products due to Supabase error");
            // Fallback to local filtering on error
            const all = await loadAffiliateProducts();
            const idSet = new Set(productIds.map((id) => String(id).trim()));
            const fallback = all.filter((p) => idSet.has(String(p.id).trim()));
            console.log("[Affiliate Store] Local fallback found:", fallback.length, "products");
            return fallback;
        }
        const normalized = (data || []).map(normalizeProduct);
        console.log("[Affiliate Store] Supabase returned:", normalized.length, "products");

        const requestedIds = new Set(productIds.map((id) => String(id).trim()));

        // Always try local fallback if Supabase returns empty OR missing some IDs
        if (normalized.length < requestedIds.size) {
            console.warn("[Affiliate Store] Supabase returned fewer products than requested, merging with local fallback");
            const all = await loadAffiliateProducts();
            console.log("[Affiliate Store] Local products loaded:", all.length);
            const existingIds = new Set(normalized.map((p) => String(p.id).trim()));
            const missing = all.filter((p) => {
                const id = String(p.id).trim();
                return requestedIds.has(id) && !existingIds.has(id);
            });
            console.log("[Affiliate Store] Missing products filled from local:", missing.length);
            return [...normalized, ...missing];
        }

        return normalized;
    } catch (error) {
        console.error("[Affiliate Store] Unexpected error fetching products by IDs:", error);
        // Last resort fallback
        try {
            const all = await loadAffiliateProducts();
            const idSet = new Set(productIds.map((id) => String(id).trim()));
            return all.filter((p) => idSet.has(String(p.id).trim()));
        } catch (fallbackError) {
            console.error("[Affiliate Store] Fallback filter failed:", fallbackError);
            return [];
        }
    }
}

export async function getProductsByCategory(category: string): Promise<AffiliateProduct[]> {
    const admin = supabaseAdmin;
    if (!admin || !hasSupabaseConfig) return [];
    try {
        const { data, error } = await admin
            .from('affiliate_products')
            .select('*')
            .ilike('category', category); // Case insensitive match

        if (error) {
            console.error("[Affiliate Store] Error fetching products by category:", error);
            return [];
        }

        return (data || []).map(normalizeProduct);
    } catch (error) {
        console.error("[Affiliate Store] Unexpected error fetching products by category:", error);
        return [];
    }
}

export async function getProductsByTags(tags: string[]): Promise<AffiliateProduct[]> {
    if (!tags.length) return [];

    const admin = supabaseAdmin;
    if (!admin || !hasSupabaseConfig) return [];

    try {
        const { data, error } = await admin
            .from('affiliate_products')
            .select('*')
            .overlaps('tags', tags); // Array overlap check

        if (error) {
            console.error("[Affiliate Store] Error fetching products by tags:", error);
            return [];
        }

        return (data || []).map(normalizeProduct);
    } catch (error) {
        console.error("[Affiliate Store] Unexpected error fetching products by tags:", error);
        return [];
    }
}

export async function getVerifiedProducts(): Promise<AffiliateProduct[]> {
    const admin = supabaseAdmin;
    if (!admin || !hasSupabaseConfig) return [];
    try {
        const { data, error } = await admin
            .from('affiliate_products')
            .select('*')
            .eq('verified', true);

        if (error) {
            console.error("[Affiliate Store] Error fetching verified products:", error);
            return [];
        }

        return (data || []).map(normalizeProduct);
    } catch (error) {
        console.error("[Affiliate Store] Unexpected error fetching verified products:", error);
        return [];
    }
}

// CRUD Operations for Admin
export async function addAffiliateProduct(product: AffiliateProduct): Promise<boolean> {
    const admin = supabaseAdmin;
    if (!admin) throw new Error("Supabase admin client is not configured");
    try {
        const dbProduct = {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price ? parseFloat(product.price) : null,
            original_price: product.originalPrice ? parseFloat(product.originalPrice) : null,
            discount: product.discount,
            image: product.image,
            link: product.link,
            platform: product.platform,
            category: product.category,
            tags: product.tags,
            rating: product.rating,
            verified: product.verified || false,
        };

        const { error } = await admin
            .from('affiliate_products')
            .insert([dbProduct]);

        if (error) {
            console.error("[Affiliate Store] Error adding product:", error);
            throw error;
        }
        // Invalidate cache so new product appears immediately
        cachedProducts = null;
        cacheTimestamp = 0;
        return true;
    } catch (error) {
        console.error("[Affiliate Store] Unexpected error adding product:", error);
        throw error;
    }
}

export async function updateAffiliateProduct(id: string, updates: Partial<AffiliateProduct>): Promise<boolean> {
    const admin = supabaseAdmin;
    if (!admin) throw new Error("Supabase admin client is not configured");
    try {
        const dbUpdates: any = { ...updates };
        if (updates.price) dbUpdates.price = parseFloat(updates.price);
        if (updates.originalPrice) dbUpdates.original_price = parseFloat(updates.originalPrice);
        delete dbUpdates.originalPrice; // Remove camelCase key

        const { error } = await admin
            .from('affiliate_products')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error("[Affiliate Store] Error updating product:", error);
            throw error;
        }
        cachedProducts = null;
        cacheTimestamp = 0;
        return true;
    } catch (error) {
        console.error("[Affiliate Store] Unexpected error updating product:", error);
        throw error;
    }
}

export async function deleteAffiliateProduct(id: string): Promise<boolean> {
    const admin = supabaseAdmin;
    if (!admin) throw new Error("Supabase admin client is not configured");
    try {
        const { error } = await admin
            .from('affiliate_products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("[Affiliate Store] Error deleting product:", error);
            throw error;
        }
        cachedProducts = null;
        cacheTimestamp = 0;
        return true;
    } catch (error) {
        console.error("[Affiliate Store] Unexpected error deleting product:", error);
        throw error;
    }
}

// Platform configuration
export const platformConfig = {
    shopee: {
        name: "Shopee",
        icon: "fa-brands fa-shopify",
        color: "#EE4D2D",
    },
    tokopedia: {
        name: "Tokopedia",
        icon: "fa-solid fa-store",
        color: "#42B549",
    },
    lazada: {
        name: "Lazada",
        icon: "fa-solid fa-shopping-bag",
        color: "#0F156D",
    },
    blibli: {
        name: "Blibli",
        icon: "fa-solid fa-cart-shopping",
        color: "#0095DA",
    },
    tiktok: {
        name: "TikTok Shop",
        icon: "fa-brands fa-tiktok",
        color: "#000000",
    },
    amazon: {
        name: "Amazon",
        icon: "fa-brands fa-amazon",
        color: "#FF9900",
    },
    other: {
        name: "Lainnya",
        icon: "fa-solid fa-link",
        color: "#6B7280",
    },
};
