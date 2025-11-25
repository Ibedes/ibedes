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

    {
        id: 'jas-hujan-sp3',
        name: 'Jas Hujan Setelan Pria Wanita Anti Rembes Tebal',
        description: 'Jas hujan setelan pria wanita anti rembes tebal, cocok untuk perjalanan hujan.',
        price: 'Rp 80.000',
        originalPrice: '-', // Optional, untuk show discount
        discount: '-', // Optional
        image: 'https://down-tx-id.img.susercontent.com/id-11134207-81ztf-mf24l8x0wglp96.webp',
        link: 'https://s.shopee.co.id/5VNhWKJC84',
        platform: 'shopee', // shopee, tokopedia, lazada, blibli, tiktok, amazon, other
        category: 'Productivity', // Kategori produk
        tags: ['tag1', 'tag2', 'relevant'], // Tags untuk matching
        rating: 4.8, // Optional
        verified: true // Set true kalau udah dicek/rekomendasi
    },
    {
        id: "tripod-kamera-1",
        name: "INBEX IB-2R 170CM Profesion Tripod Kamera Handphone Bluetooth Remote Konten Remote Bluetooth Aluminium",
        description: "INBEX IB-2R 170CM Tripod Bluetooth Remote hp anti goyang with Holder&Carry Bag ⭐ Selamat datang di Toko Resmi INBEX (Selamat datang di inbexstudio⭐",
        price: "79699",
        originalPrice: "400000",
        discount: "80%",
        image: "https://down-id.img.susercontent.com/file/id-11134207-7r98s-ly7rdig42me338@resize_w450_nl.webp",
        link: "https://s.shopee.co.id/3fw7k6v8Hg",
        platform: "shopee",
        category: "Productivity,camera",
        tags: ["camera", "productivity"],
        rating: 4.8,
        verified: true
    },
    {
        id: "smart-watch-1",
        name: "Samsung SmartWatch XS 11 PRO MAX",
        description: "0% asli, ada garansi, Anda dapat membeli dengan percaya diri\n\nSetelah menerima barang, silakan tinggalkan pujian bintang lima Anda\n\nIkuti kami untuk informasi tentang diskon dan produk serta kupon baru\n\nGrosir dan distributor dipersilakan.",
        price: "142499",
        originalPrice: "8888888",
        discount: "98%",
        image: "https://down-ws-id.img.susercontent.com/id-11134207-82250-mh9x4u6msrgvc9.webp",
        link: "https://s.shopee.co.id/9zqBGrKNwi",
        platform: "shopee",
        category: "Productivity, smartwatch",
        tags: ["camera", "smartwatch"],
        rating: 4.7,
        verified: true
    },
    {
        id: "kipas",
        name: "kipas",
        description: "sf",
        price: "79699",
        
        
        image: "https://down-bs-id.img.susercontent.com/sg-11134201-8258x-mev4122dts05ef.webp",
        link: "https://s.shopee.co.id/7V8qfWo2B0",
        platform: "shopee",
        category: "Productivity",
        tags: ["tag1"],
        
        verified: true
    }
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