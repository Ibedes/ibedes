import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";

export const prerender = false;

const projectRoot = process.cwd();
const metadataPath = path.join(projectRoot, "src/data/custom-pages.json");
const customPagesDir = path.join(projectRoot, "src/pages/custom");
const isProduction = import.meta.env.PROD || process.env.NODE_ENV === "production";
const allowReadInProd =
    process.env.ALLOW_PAGE_BUILDER_PROD === "true" ||
    process.env.PREVIEW_ALLOW_FS === "true";

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
        return new Response(JSON.stringify({ error: "Slug wajib diisi." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        if (isProduction && !allowReadInProd) {
            return new Response(
                JSON.stringify({
                    error:
                        "Page Builder dimatikan di production (filesystem read-only). Jalankan lokal atau set ALLOW_PAGE_BUILDER_PROD=true jika Anda yakin.",
                }),
                { status: 503, headers: { "Content-Type": "application/json" } },
            );
        }

        const raw = await fs.readFile(metadataPath, "utf-8");
        const pages = JSON.parse(raw) as any[];
        const page = pages.find((p) => p.slug === slug);

        if (!page) {
            return new Response(JSON.stringify({ error: "Halaman tidak ditemukan." }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        let html = page.html ?? "";
        let css = page.css ?? "";
        let js = page.js ?? "";

        // Backfill from astro source if metadata belum menyimpan kode
        if (!html || !css || !js) {
            try {
                const astroSource = await fs.readFile(
                    path.join(customPagesDir, `${slug}.astro`),
                    "utf-8",
                );

                const grabString = (label: string) => {
                    const match = astroSource.match(
                        new RegExp(`const ${label} =\\s*(.+);`),
                    );
                    if (match?.[1]) {
                        try {
                            return JSON.parse(match[1]);
                        } catch {
                            return "";
                        }
                    }
                    return "";
                };

                html ||= grabString("htmlContent");
                css ||= grabString("cssContent");
                js ||= grabString("jsContent");
            } catch (err) {
                // ignore and keep empty fallback
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                title: page.title,
                slug: page.slug,
                path: page.path,
                html,
                css,
                js,
                updatedAt: page.updatedAt,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    } catch (error: any) {
        console.error("[Page Builder] Error loading page", error);
        return new Response(
            JSON.stringify({ error: error?.message || "Internal Server Error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
};
