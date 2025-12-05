import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import type { AffiliateProduct } from "../../../lib/affiliates";


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

        // Use the new Supabase-backed function
        const { deleteAffiliateProduct } = await import("../../../lib/affiliates");
        await deleteAffiliateProduct(id);

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
