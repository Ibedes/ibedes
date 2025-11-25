// Affiliate management system for ibedes.xyz

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
}

export interface ArticleAffiliate {
    articleSlug: string;
    productIds: string[];
    context?: string; // context untuk menampilkan produk (contoh: "Produk yang membantu perjalanan spiritual")
}

// Database affiliate produk
export const affiliateProducts: AffiliateProduct[] = [
    // Produk untuk artikel motivasi
];

// Mapping artikel dengan produk affiliate
export const articleAffiliates: ArticleAffiliate[] = [];

// Helper functions
export function getAffiliateByArticle(articleSlug: string): ArticleAffiliate | null {
    return articleAffiliates.find(aff => aff.articleSlug === articleSlug) || null;
}

export function getAffiliateProductsByIds(productIds: string[]): AffiliateProduct[] {
    return productIds
        .map(id => affiliateProducts.find(product => product.id === id))
        .filter((product): product is AffiliateProduct => product !== undefined);
}

export function getProductsByCategory(category: string): AffiliateProduct[] {
    return affiliateProducts.filter(product =>
        product.category.toLowerCase() === category.toLowerCase()
    );
}

export function getProductsByTags(tags: string[]): AffiliateProduct[] {
    return affiliateProducts.filter(product =>
        tags.some(tag => product.tags.includes(tag))
    );
}

export function getVerifiedProducts(): AffiliateProduct[] {
    return affiliateProducts.filter(product => product.verified);
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