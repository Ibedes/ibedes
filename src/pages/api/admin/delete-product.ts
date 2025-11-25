import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const prerender = false;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const POST: APIRoute = async ({ request }) => {
    try {
        const { id } = await request.json();

        if (!id) {
            return new Response(
                JSON.stringify({ error: "Missing product id" }),
                { status: 400 },
            );
        }

        const currentDir = fileURLToPath(new URL(".", import.meta.url));
        const projectRoot = path.resolve(currentDir, "../../../../");
        const affiliatesPath = path.join(projectRoot, "src/lib/affiliates.ts");

        let fileContent = await fs.readFile(affiliatesPath, "utf-8");
        const arrayRegex =
            /export const affiliateProducts: AffiliateProduct\[\] = \[([\s\S]*?)\];/;
        const arrayMatch = fileContent.match(arrayRegex);

        if (!arrayMatch) {
            return new Response(
                JSON.stringify({ error: "Could not locate affiliateProducts array" }),
                { status: 500 },
            );
        }

        const body = arrayMatch[1];
        const productPattern = new RegExp(
            `\\s*\\{[\\s\\S]*?id:\\s*['\"]${escapeRegExp(id)}['\"][\\s\\S]*?\\}\\s*,?`,
            "m",
        );

        if (!productPattern.test(body)) {
            return new Response(
                JSON.stringify({ error: `Product with id \"${id}\" not found` }),
                { status: 404 },
            );
        }

        const updatedBody = body
            .replace(productPattern, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trimEnd();

        fileContent = fileContent.replace(
            arrayRegex,
            `export const affiliateProducts: AffiliateProduct[] = [${updatedBody}\n];`,
        );

        await fs.writeFile(affiliatesPath, fileContent, "utf-8");
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
