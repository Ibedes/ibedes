import type { APIRoute } from "astro";
import type { AffiliateProduct } from "../../../lib/affiliates";

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

        const normalizedPrice = normalizePrice(product.price);
        const normalizedOriginalPrice = normalizePrice(product.originalPrice);

        const updates: Partial<AffiliateProduct> = {
            name: product.name,
            description: product.description,
            image: product.image,
            link: product.link,
            platform: product.platform,
            category: product.category || "General",
            tags: normalizeTags(product.tags),
            verified: Boolean(product.verified),
        };

        if (normalizedPrice) updates.price = normalizedPrice;
        if (normalizedOriginalPrice)
            updates.originalPrice = normalizedOriginalPrice;
        if (product.discount) updates.discount = product.discount;
        if (typeof product.rating === "number" && !Number.isNaN(product.rating)) {
            updates.rating = product.rating;
        }

        // Use the new Supabase-backed function
        const { updateAffiliateProduct } = await import("../../../lib/affiliates");
        await updateAffiliateProduct(product.id, updates);

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
