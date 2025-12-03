// Affiliate management system for ibedes.xyz

import fs from "node:fs/promises";
import path from "node:path";
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
    verified?: boolean; // produk yang sudah dicek/direkomendasikan
    score?: number; // ranking score (clicks + recency + verified)
    clicks?: number; // aggregated clicks from analytics
}

export interface ArticleAffiliate {
    articleSlug: string;
    productIds: string[];
    context?: string; // context untuk menampilkan produk (contoh: "Produk yang membantu perjalanan spiritual")
}

const PROJECT_DATA_PATH = path.join(
    process.cwd(),
    "src",
    "data",
    "affiliate-products.json",
);

export const getAffiliateDataPath = () => {
    if (process.env.AFFILIATE_DATA_PATH) {
        return process.env.AFFILIATE_DATA_PATH;
    }
    const isLambda =
        !!process.env.NETLIFY || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    if (isLambda) {
        return path.join("/tmp", "affiliate-products.json");
    }
    return PROJECT_DATA_PATH;
};

export async function ensureAffiliateDataDir(targetPath = getAffiliateDataPath()) {
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
}

async function readAffiliateFile(): Promise<AffiliateProduct[]> {
    const targetPath = getAffiliateDataPath();
    try {
        const content = await fs.readFile(targetPath, "utf-8");
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
            return parsed as AffiliateProduct[];
        }
        console.warn(
            "[Affiliate Store] affiliate-products.json is not an array. Returning empty list.",
        );
        return [];
    } catch (error: any) {
        // On lambda, seed /tmp from bundled project file if available
        if (
            (error.code === "ENOENT" || error.code === "EISDIR") &&
            targetPath.startsWith("/tmp")
        ) {
            try {
                const fallbackContent = await fs.readFile(PROJECT_DATA_PATH, "utf-8");
                await ensureAffiliateDataDir(targetPath);
                await fs.writeFile(targetPath, fallbackContent, "utf-8");
                const seeded = JSON.parse(fallbackContent);
                console.warn("[Affiliate Store] Seeded /tmp affiliate store from bundled JSON");
                return Array.isArray(seeded) ? seeded : [];
            } catch (seedErr) {
                console.error("[Affiliate Store] Failed to seed affiliate store:", seedErr);
            }
        }
        console.error("[Affiliate Store] Failed to read affiliate products:", error);
        return [];
    }
}

export async function loadAffiliateProducts(): Promise<AffiliateProduct[]> {
    return readAffiliateFile();
}

/**
 * Combine recency (urutan di file), click performance, dan label verified
 * untuk menyusun rekomendasi dinamis. Dipakai di halaman publik yang butuh
 * prioritas produk paling relevan.
 */
export async function loadAffiliateProductsRanked(options?: {
    days?: number; // window analitik untuk klik
    limit?: number; // batasi hasil (optional)
    clickWeight?: number; // bobot klik vs recency
    recencyWeight?: number;
    verifiedBoost?: number; // tambahan skor jika verified
}): Promise<AffiliateProduct[]> {
    const {
        days = 30,
        limit,
        clickWeight = 0.55,
        recencyWeight = 0.35,
        verifiedBoost = 0.1,
    } = options || {};

    const products = await loadAffiliateProducts();

    // Ambil agregat klik (per productId) dari analytics; fallback aman ke 0
    const clicksSummary = await getAffiliateClicksSummary(days, 500);
    const clickMap = new Map<string, number>();
    clicksSummary.forEach((item) => clickMap.set(item.productId, item.clicks));

    const maxClicks = Math.max(0, ...Array.from(clickMap.values()));
    const total = products.length || 1;

    const scored = products.map((product, idx) => {
        const clicks = clickMap.get(product.id) ?? 0;
        const clickScore = maxClicks > 0 ? clicks / maxClicks : 0;
        // Asumsikan produk terbaru ditambahkan di bawah file, jadi idx lebih tinggi = lebih baru
        const recencyScore = (idx + 1) / total;
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
    const products = await loadAffiliateProducts();
    return productIds
        .map(id => products.find(product => product.id === id))
        .filter((product): product is AffiliateProduct => product !== undefined);
}

export async function getProductsByCategory(category: string): Promise<AffiliateProduct[]> {
    const products = await loadAffiliateProducts();
    return products.filter(product =>
        product.category?.toLowerCase() === category.toLowerCase()
    );
}

export async function getProductsByTags(tags: string[]): Promise<AffiliateProduct[]> {
    const products = await loadAffiliateProducts();
    return products.filter(product =>
        tags.some(tag => product.tags.includes(tag))
    );
}

export async function getVerifiedProducts(): Promise<AffiliateProduct[]> {
    const products = await loadAffiliateProducts();
    return products.filter(product => product.verified);
}

// Platform configuration
export const platformConfig = {
    shopee: {
        name: 'Shopee',
        color: '#EE4D2D',
        icon: 'fa-solid fa-cart-shopping'
    },
    tokopedia: {
        name: 'Tokopedia',
        color: '#42B549',
        icon: 'fa-solid fa-store'
    },
    lazada: {
        name: 'Lazada',
        color: '#0F1471',
        icon: 'fa-solid fa-bag-shopping'
    },
    blibli: {
        name: 'Blibli',
        color: '#0095DA',
        icon: 'fa-solid fa-basket-shopping'
    },
    tiktok: {
        name: 'TikTok Shop',
        color: '#000000',
        icon: 'fa-brands fa-tiktok'
    },
    amazon: {
        name: 'Amazon',
        color: '#FF9900',
        icon: 'fa-brands fa-amazon'
    },
    other: {
        name: 'Lainnya',
        color: '#6B7280',
        icon: 'fa-solid fa-link'
    }
};
