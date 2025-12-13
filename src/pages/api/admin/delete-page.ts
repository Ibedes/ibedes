import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";

export const prerender = false;

const projectRoot = process.cwd();
const customPagesDir = path.join(projectRoot, "src/pages/custom");
const metadataPath = path.join(projectRoot, "src/data/custom-pages.json");
const publicPagesDir = path.join(projectRoot, "public/custom-pages");

export const POST: APIRoute = async ({ request }) => {
    try {
        const { slug } = await request.json();
        if (!slug || typeof slug !== "string") {
            return new Response(JSON.stringify({ error: "Slug wajib diisi." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        let pages: any[] = [];
        try {
            const raw = await fs.readFile(metadataPath, "utf-8");
            pages = JSON.parse(raw);
        } catch (err) {
            return new Response(JSON.stringify({ error: "Metadata tidak ditemukan." }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        const nextPages = pages.filter((p) => p.slug !== slug);
        if (nextPages.length === pages.length) {
            return new Response(JSON.stringify({ error: "Halaman tidak ditemukan." }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        await fs.writeFile(metadataPath, JSON.stringify(nextPages, null, 2), "utf-8");

        const astroPath = path.join(customPagesDir, `${slug}.astro`);
        const publicPath = path.join(publicPagesDir, `${slug}.html`);

        // best-effort delete files
        await Promise.allSettled([
            fs.rm(astroPath, { force: true }),
            fs.rm(publicPath, { force: true }),
        ]);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("[Page Builder] Error deleting page", error);
        return new Response(
            JSON.stringify({ error: error?.message || "Internal Server Error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
};
