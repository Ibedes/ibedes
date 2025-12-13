import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";

export const prerender = false;

const projectRoot = process.cwd();
const customPagesDir = path.join(projectRoot, "src/pages/custom");
const metadataPath = path.join(projectRoot, "src/data/custom-pages.json");
const publicPagesDir = path.join(projectRoot, "public/custom-pages");

const normalizeSlug = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/--+/g, "-")
        .replace(/^-|-$/g, "");

const escapeScriptTag = (value: string) => value.replace(/<\/script/gi, "<\\/script");

const extractBody = (html: string) => {
    const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return match ? match[1].trim() : html;
};

const injectResources = (html: string, css: string, js: string) => {
    let output = html;
    if (css?.trim()) {
        output = output.replace(
            /<\/head>/i,
            `<style>\n${css}\n</style></head>`,
        );
    }
    if (js?.trim()) {
        if (/<\/body>/i.test(output)) {
            output = output.replace(
                /<\/body>/i,
                `<script>\n${js}\n</script></body>`,
            );
        } else {
            output += `\n<script>\n${js}\n</script>`;
        }
    }
    return output;
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const rawSlug = typeof body.slug === "string" ? body.slug : "";
        const slug = normalizeSlug(rawSlug);
        const title = (body.title ?? "").toString().trim() || `Custom Page - ${slug || "untitled"}`;
        const html = (body.html ?? "").toString();
        const css = (body.css ?? "").toString();
        const js = escapeScriptTag((body.js ?? "").toString());
        const hasFullDocument = /<html[^>]*>/i.test(html);
        const bodyHtml = extractBody(html);

        if (!slug) {
            return new Response(
                JSON.stringify({ error: "Slug wajib diisi (huruf, angka, strip)." }),
                { status: 400, headers: { "Content-Type": "application/json" } },
            );
        }

        if (!html.trim() && !css.trim() && !js.trim()) {
            return new Response(
                JSON.stringify({ error: "Isi HTML/CSS/JS tidak boleh kosong." }),
                { status: 400, headers: { "Content-Type": "application/json" } },
            );
        }

        await fs.mkdir(customPagesDir, { recursive: true });
        await fs.mkdir(path.dirname(metadataPath), { recursive: true });
        await fs.mkdir(publicPagesDir, { recursive: true });

        const astroSource = `---\nimport Layout from "../../layouts/Layout.astro";\nconst pageTitle = ${JSON.stringify(title)};\nconst description = "Custom page dibuat lewat Page Builder";\nconst htmlContent = ${JSON.stringify(bodyHtml)};\nconst cssContent = ${JSON.stringify(css)};\nconst jsContent = ${JSON.stringify(js)};\n---\n\n<Layout title={pageTitle} description={description}>\n    {cssContent ? <style is:global>{cssContent}</style> : null}\n    <main class="page-builder-output" data-custom-page="${slug}">\n        <div class="page-builder-html" set:html={htmlContent}></div>\n    </main>\n    {jsContent ? (\n        <script is:inline>\n            {jsContent}\n        </script>\n    ) : null}\n</Layout>\n`;

        const astroPath = path.join(customPagesDir, `${slug}.astro`);
        await fs.writeFile(astroPath, astroSource, "utf-8");

        const publicHtml = hasFullDocument
            ? injectResources(html, css, js)
            : `<!doctype html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n  <title>${title}</title>\n  <style>\n  ${css}\n  </style>\n</head>\n<body>\n${html}\n<script>\n${js}\n</script>\n</body>\n</html>`;

        const publicPath = path.join(publicPagesDir, `${slug}.html`);
        await fs.writeFile(publicPath, publicHtml, "utf-8");

        let pages: any[] = [];
        try {
            const existing = await fs.readFile(metadataPath, "utf-8");
            pages = JSON.parse(existing);
        } catch (err) {
            console.warn("[Page Builder] metadata belum ada, membuat baru", err?.message);
        }

        const updatedAt = new Date().toISOString();
        const entry = {
            slug,
            title,
            path: `/custom/${slug}`,
            publicPath: `/custom-pages/${slug}.html`,
            updatedAt,
            html,
            css,
            js,
        };
        const index = pages.findIndex((p) => p.slug === slug);
        if (index >= 0) {
            pages[index] = { ...pages[index], ...entry };
        } else {
            pages.unshift(entry);
        }

        await fs.writeFile(metadataPath, JSON.stringify(pages, null, 2), "utf-8");

        return new Response(
            JSON.stringify({
                success: true,
                message: "Page berhasil disimpan",
                path: entry.path,
                staticPath: entry.publicPath,
                updatedAt,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    } catch (error: any) {
        console.error("[Page Builder] Error saving page", error);
        return new Response(
            JSON.stringify({ error: error?.message || "Internal Server Error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
};
