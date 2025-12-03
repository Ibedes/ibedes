import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import type { AffiliateProduct } from "../../../lib/affiliates";
import {
    getAffiliateDataPath,
    ensureAffiliateDataDir,
} from "../../../lib/affiliates";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const { id } = await request.json();

        if (!id) {
            return new Response(
                JSON.stringify({ error: "Missing product id" }),
                { status: 400 },
            );
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

        const filteredProducts = products.filter(
            (product) => product.id.toLowerCase() !== String(id).toLowerCase(),
        );

        if (filteredProducts.length === products.length) {
            return new Response(
                JSON.stringify({ error: `Product with id "${id}" not found` }),
                { status: 404 },
            );
        }

        await ensureAffiliateDataDir(affiliatesJsonPath);
        await fs.writeFile(affiliatesJsonPath, JSON.stringify(filteredProducts, null, 4), "utf-8");
        console.log(`[Admin API] Deleted product ${id}`);

        return new Response(
            JSON.stringify({ success: true, message: "Product deleted" }),
            { status: 200 },
        );
    } catch (error: any) {
        console.error("[Admin API] Error deleting product", error);
        return new Response(
            JSON.stringify({ error: error?.message || "Internal Server Error" }),
            { status: 500 },
        );
    }
};
