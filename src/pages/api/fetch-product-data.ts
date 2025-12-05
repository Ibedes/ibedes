import type { APIRoute } from "astro";

export const prerender = false;

interface ProductMetadata {
    title?: string;
    price?: string;
    image?: string;
    description?: string;
    platform?: string;
}

/**
 * Scrape product metadata from marketplace URLs
 * Supports: Shopee, Tokopedia, TikTok Shop
 */
export const POST: APIRoute = async ({ request }) => {
    try {
        const { url } = await request.json();

        if (!url || typeof url !== "string") {
            return new Response(
                JSON.stringify({ error: "URL is required" }),
                { status: 400 }
            );
        }

        // Detect platform
        const platform = detectPlatform(url);
        if (!platform) {
            return new Response(
                JSON.stringify({ error: "Unsupported platform. Only Shopee, Tokopedia, and TikTok Shop are supported." }),
                { status: 400 }
            );
        }

        // Fetch the page
        const response = await fetch(url, {
            redirect: 'follow', // Follow redirects (important for Shopee short URLs)
            headers: {
                // Use WhatsApp User-Agent as it's whitelisted by TikTok/Tokopedia/Shopee
                "User-Agent": "WhatsApp/2.21.12.21 A",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            },
        });

        if (!response.ok) {
            return new Response(
                JSON.stringify({ error: `Failed to fetch URL: ${response.statusText}` }),
                { status: response.status }
            );
        }

        const html = await response.text();

        // Update platform detection based on final URL if possible, or just use robust extraction
        // For now, we stick to input URL but make extraction smarter

        // Extract metadata
        const metadata = extractMetadata(html, platform);

        return new Response(
            JSON.stringify({
                success: true,
                data: {
                    title: metadata.title || "",
                    price: metadata.price || "",
                    image: metadata.image || "",
                    description: metadata.description || "",
                    platform: platform,
                },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error: any) {
        console.error("[Fetch Product Data] Error:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Internal server error" }),
            { status: 500 }
        );
    }
};

function detectPlatform(url: string): string | null {
    const urlLower = url.toLowerCase();
    if (urlLower.includes("shopee.co.id") || urlLower.includes("shopee.com")) {
        return "shopee";
    }
    if (urlLower.includes("tokopedia.com")) {
        return "tokopedia";
    }
    if (urlLower.includes("tiktok.com")) {
        return "tiktok";
    }
    return null;
}

function extractMetadata(html: string, platform: string): ProductMetadata {
    const metadata: ProductMetadata = {};

    // Extract Open Graph tags
    metadata.title = extractOGTag(html, "og:title") || extractOGTag(html, "twitter:title");
    metadata.image = extractOGTag(html, "og:image") || extractOGTag(html, "twitter:image");
    metadata.description = extractOGTag(html, "og:description") || extractOGTag(html, "twitter:description");

    // Extract price - try multiple methods
    metadata.price =
        extractOGTag(html, "product:price:amount") ||
        extractOGTag(html, "product:price") ||
        extractPriceFromHTML(html, platform);

    // Platform-specific extraction
    if (platform === "shopee") {
        metadata.price = metadata.price || extractShopeePrice(html);
    } else if (platform === "tokopedia") {
        metadata.price = metadata.price || extractTokopediaPrice(html) || extractTikTokPrice(html); // Tokopedia now uses TikTok infra
    } else if (platform === "tiktok") {
        metadata.price = metadata.price || extractTikTokPrice(html);
    }

    return metadata;
}

function extractOGTag(html: string, property: string): string | undefined {
    // Match both property and name attributes, allowing other attributes in between
    const patterns = [
        // property="..." ... content="..."
        new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, "i"),
        // content="..." ... property="..."
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, "i"),
        // name="..." ... content="..."
        new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, "i"),
        // content="..." ... name="..."
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, "i"),
    ];

    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
            return decodeHTMLEntities(match[1]);
        }
    }

    return undefined;
}

function extractPriceFromHTML(html: string, platform: string): string | undefined {
    // Try to find JSON-LD structured data
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/is);
    if (jsonLdMatch) {
        try {
            const jsonData = JSON.parse(jsonLdMatch[1]);
            if (jsonData["@type"] === "Product" && jsonData.offers) {
                const price = jsonData.offers.price || jsonData.offers.lowPrice;
                if (price) {
                    return String(price);
                }
            }
        } catch (e) {
            // JSON parsing failed, continue
        }
    }

    // Try RENDER_DATA JSON (Common in TikTok/Tokopedia Shop)
    const renderDataMatch = html.match(/<script[^>]*id=["']RENDER_DATA["'][^>]*>(.*?)<\/script>/is);
    if (renderDataMatch) {
        try {
            // The content might be URL encoded, but usually it's just JSON
            let jsonContent = renderDataMatch[1];
            // Sometimes it's URL encoded
            if (jsonContent.includes('%7B')) {
                jsonContent = decodeURIComponent(jsonContent);
            }

            const jsonData = JSON.parse(jsonContent);

            // Navigate to find price: 2 -> initialData -> productInfo -> price -> min_price
            // The structure is complex and variable, let's try to find price object recursively or by known paths

            // Path 1: TikTok Shop structure
            // usually in a deeply nested object. Let's try regex on the JSON string for simplicity and robustness
            const priceMatch = jsonContent.match(/"min_price":"([\d\.]+)"/);
            if (priceMatch && priceMatch[1]) {
                return priceMatch[1].replace(/\./g, ""); // Remove dots (149.000 -> 149000)
            }

        } catch (e) {
            // Parsing failed
        }
    }

    return undefined;
}

function extractShopeePrice(html: string): string | undefined {
    // Shopee-specific price extraction patterns
    const patterns = [
        /"price":\s*(\d+)/i,
        /"price_min":\s*(\d+)/i,
        /"price_before_discount":\s*(\d+)/i,
    ];

    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
            // Shopee prices are usually in cents, divide by 100000
            const price = parseInt(match[1]) / 100000;
            return String(Math.round(price));
        }
    }

    return undefined;
}

function extractTokopediaPrice(html: string): string | undefined {
    // Tokopedia-specific price extraction patterns
    const patterns = [
        /"price":\s*"?(\d+)"?/i,
        /"priceFmt":\s*"([^"]+)"/i,
    ];

    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
            // Extract numbers only
            const numbers = match[1].replace(/\D/g, "");
            if (numbers) {
                return numbers;
            }
        }
    }

    return undefined;
}

function extractTikTokPrice(html: string): string | undefined {
    // TikTok Shop-specific price extraction patterns
    const patterns = [
        /"price":\s*"?(\d+)"?/i,
        /"salePrice":\s*"?(\d+)"?/i,
        /"min_price":"([\d\.]+)"/i, // Added for TikTok Shop
    ];

    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
            return match[1].replace(/\./g, "");
        }
    }

    return undefined;
}

function decodeHTMLEntities(text: string): string {
    const entities: Record<string, string> = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#039;": "'",
        "&apos;": "'",
    };

    return text.replace(/&[a-z]+;|&#\d+;/gi, (match) => entities[match] || match);
}
