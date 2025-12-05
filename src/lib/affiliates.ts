import { supabaseAdmin } from "./supabase";
import { getAffiliateClicksSummary } from "./analytics-store";

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

export async function loadAffiliateProducts(): Promise<AffiliateProduct[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('affiliate_products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("[Affiliate Store] Error loading products:", error);
            console.error("[Affiliate Store] Supabase URL:", import.meta.env.PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
            console.error("[Affiliate Store] Service Key:", import.meta.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');
            return [];
        }

        return (data || []).map(normalizeProduct);
    } catch (error) {
        console.error("[Affiliate Store] Unexpected error loading products:", error);
        return [];
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

    try {
        const { data, error } = await supabaseAdmin
            .from('affiliate_products')
            .select('*')
            .in('id', productIds);

        if (error) {
            console.error("[Affiliate Store] Error fetching products by IDs:", error);
            return [];
        }

        return (data || []).map(normalizeProduct);
    } catch (error) {
        console.error("[Affiliate Store] Unexpected error fetching products by IDs:", error);
        return [];
    }
}

export async function getProductsByCategory(category: string): Promise<AffiliateProduct[]> {
    try {
        const { data, error } = await supabaseAdmin
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

    try {
        const { data, error } = await supabaseAdmin
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
    try {
        const { data, error } = await supabaseAdmin
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

        const { error } = await supabaseAdmin
            .from('affiliate_products')
            .insert([dbProduct]);

        if (error) {
            console.error("[Affiliate Store] Error adding product:", error);
            throw error;
        }
        return true;
    } catch (error) {
        console.error("[Affiliate Store] Unexpected error adding product:", error);
        throw error;
    }
}

export async function updateAffiliateProduct(id: string, updates: Partial<AffiliateProduct>): Promise<boolean> {
    try {
        const dbUpdates: any = { ...updates };
        if (updates.price) dbUpdates.price = parseFloat(updates.price);
        if (updates.originalPrice) dbUpdates.original_price = parseFloat(updates.originalPrice);
        delete dbUpdates.originalPrice; // Remove camelCase key

        const { error } = await supabaseAdmin
            .from('affiliate_products')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error("[Affiliate Store] Error updating product:", error);
            throw error;
        }
        return true;
    } catch (error) {
        console.error("[Affiliate Store] Unexpected error updating product:", error);
        throw error;
    }
}

export async function deleteAffiliateProduct(id: string): Promise<boolean> {
    try {
        const { error } = await supabaseAdmin
            .from('affiliate_products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("[Affiliate Store] Error deleting product:", error);
            throw error;
        }
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
