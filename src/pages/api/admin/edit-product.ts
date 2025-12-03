import type { APIRoute } from "astro";
import fs from "node:fs/promises";
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

        console.log(`[Admin API] Updating product: ${product.id}`);

        // Validate required fields
        if (!product.id || !product.name || !product.description || !product.image || !product.link || !product.platform) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        const affiliatesJsonPath = getAffiliateDataPath();
        let products: AffiliateProduct[] = [];

        try {
            const fileContent = await fs.readFile(affiliatesJsonPath, "utf-8");
            products = JSON.parse(fileContent);
        } catch (err) {
            console.error("[Admin API] Unable to read affiliate-products.json", err);
            return new Response(
                JSON.stringify({ error: "Affiliate product store not found" }),
                { status: 500 },
            );
        }

        const productIndex = products.findIndex(
            (item) => item.id.toLowerCase() === String(product.id).toLowerCase(),
        );

        if (productIndex === -1) {
            return new Response(JSON.stringify({ error: "Product not found in store" }), {
                status: 404,
            });
        }

        const normalizedPrice = normalizePrice(product.price);
        const normalizedOriginalPrice = normalizePrice(product.originalPrice);

        const updatedProduct: AffiliateProduct = {
            id: product.id,
            name: product.name,
            description: product.description,
            image: product.image,
            link: product.link,
            platform: product.platform,
            category: product.category || "General",
            tags: normalizeTags(product.tags),
            verified: Boolean(product.verified),
        };

        if (normalizedPrice) updatedProduct.price = normalizedPrice;
        if (normalizedOriginalPrice)
            updatedProduct.originalPrice = normalizedOriginalPrice;
        if (product.discount) updatedProduct.discount = product.discount;
        if (typeof product.rating === "number" && !Number.isNaN(product.rating)) {
            updatedProduct.rating = product.rating;
        }

        products[productIndex] = updatedProduct;

        // Write back to file
        await ensureAffiliateDataDir(affiliatesJsonPath);
        await fs.writeFile(affiliatesJsonPath, JSON.stringify(products, null, 4), "utf-8");
        console.log(`[Admin API] Product updated successfully`);

        return new Response(
            JSON.stringify({ success: true, message: "Product updated successfully" }),
            { status: 200 },
        );
    } catch (error: any) {
        console.error("[Admin API] Error updating product:", error);
        return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
    }
};
