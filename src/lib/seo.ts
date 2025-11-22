// SEO utilities and structured data helpers

export interface Article {
    title: string;
    description: string;
    publishedTime: string;
    modifiedTime?: string;
    author: string;
    tags?: string[];
    image?: string;
    url: string;
}

export interface Product {
    name: string;
    description?: string;
    image: string;
    price: string;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    brand?: string;
    rating?: number;
    reviewCount?: number;
    url: string;
}

export interface BreadcrumbItem {
    name: string;
    url: string;
}

/**
 * Generate JSON-LD structured data for an article
 */
export function generateArticleSchema(article: Article, siteUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        image: article.image ? `${siteUrl}${article.image}` : undefined,
        datePublished: article.publishedTime,
        dateModified: article.modifiedTime || article.publishedTime,
        author: {
            '@type': 'Person',
            name: article.author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'ibedes',
            logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/ibedes.jpg`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': article.url,
        },
        keywords: article.tags?.join(', '),
    };
}

/**
 * Generate JSON-LD structured data for a product
 */
export function generateProductSchema(product: Product, siteUrl: string) {
    const schema: any = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.image,
        description: product.description,
        offers: {
            '@type': 'Offer',
            url: product.url,
            priceCurrency: product.currency || 'IDR',
            price: product.price.replace(/[^0-9]/g, ''),
            availability: `https://schema.org/${product.availability || 'InStock'}`,
        },
    };

    if (product.brand) {
        schema.brand = {
            '@type': 'Brand',
            name: product.brand,
        };
    }

    if (product.rating && product.reviewCount) {
        schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
        };
    }

    return schema;
}

/**
 * Generate JSON-LD structured data for breadcrumbs
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[], siteUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${siteUrl}${item.url}`,
        })),
    };
}

/**
 * Generate JSON-LD structured data for website
 */
export function generateWebsiteSchema(siteUrl: string, siteName: string, description: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        description: description,
        url: siteUrl,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${siteUrl}/blog?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

/**
 * Generate JSON-LD structured data for person/author
 */
export function generatePersonSchema(
    name: string,
    url: string,
    image: string,
    sameAs: string[]
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: name,
        url: url,
        image: image,
        sameAs: sameAs,
    };
}

/**
 * Extract reading time from content
 */
export function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

/**
 * Generate meta tags for social sharing
 */
export function generateSocialMeta(
    title: string,
    description: string,
    image: string,
    url: string,
    type: 'website' | 'article' = 'website'
) {
    return {
        // Open Graph
        'og:title': title,
        'og:description': description,
        'og:image': image,
        'og:url': url,
        'og:type': type,
        'og:site_name': 'ibedes',

        // Twitter Card
        'twitter:card': 'summary_large_image',
        'twitter:title': title,
        'twitter:description': description,
        'twitter:image': image,
    };
}
