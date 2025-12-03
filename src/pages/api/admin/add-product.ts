import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AffiliateProduct } from "../../../lib/affiliates";
import {
    getAffiliateDataPath,
    ensureAffiliateDataDir,
} from "../../../lib/affiliates";

export const prerender = false;

const normalizePrice = (value?: string) => {
    if (!value) return undefined;
    const digits = String(value).replace(/[^\d]/g, "");
    return digits || undefined;
};

const normalizeTags = (tags: unknown): string[] => {
    if (Array.isArray(tags)) {
        return tags
            .map((tag) => String(tag).trim())
            .filter((tag) => tag.length > 0);
    }
    if (typeof tags === "string") {
        return tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);
    }
    return [];
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const product = await request.json();

        console.log(`[Admin API] Adding product: ${product.id}`);

        // Validate required fields
        if (!product.id || !product.name || !product.description || !product.image || !product.link || !product.platform) {
            console.error('[Admin API] Missing required fields');
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        const affiliatesJsonPath = getAffiliateDataPath();
        let existingProducts: AffiliateProduct[] = [];

        try {
            const fileContent = await fs.readFile(affiliatesJsonPath, "utf-8");
            existingProducts = JSON.parse(fileContent);
        } catch (err) {
            console.warn(
                "[Admin API] affiliate-products.json not found, creating new one.",
                err,
            );
        }

        if (
            existingProducts.some(
                (item) => item.id.toLowerCase() === product.id.toLowerCase(),
            )
        ) {
            return new Response(
                JSON.stringify({
                    error: `Product with id "${product.id}" already exists`,
                }),
                { status: 409 },
            );
        }

        const normalizedPrice = normalizePrice(product.price);
        const normalizedOriginalPrice = normalizePrice(product.originalPrice);

        const newProduct: AffiliateProduct = {
            id: product.id,
            name: product.name,
            description: product.description,
            image: product.image,
            link: product.link,
            platform: product.platform,
            category: product.category || "General",
            tags: normalizeTags(product.tags),
        };

        if (normalizedPrice) newProduct.price = normalizedPrice;
        if (normalizedOriginalPrice)
            newProduct.originalPrice = normalizedOriginalPrice;
        if (product.discount) newProduct.discount = product.discount;
        if (typeof product.rating === "number") newProduct.rating = product.rating;
        if (product.verified) newProduct.verified = true;

        existingProducts.push(newProduct);

        await ensureAffiliateDataDir(affiliatesJsonPath);
        await fs.writeFile(
            affiliatesJsonPath,
            JSON.stringify(existingProducts, null, 4),
            "utf-8",
        );
        console.log(`[Admin API] Product added successfully`);

        return new Response(JSON.stringify({ success: true, message: 'Product added successfully' }), { status: 200 });
    } catch (error: any) {
        console.error('[Admin API] Error adding product:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
    }
};
