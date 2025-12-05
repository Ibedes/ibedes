import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getGitHubCMS } from '../../../lib/github-cms';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        let data;
        try {
            data = await request.json();
        } catch (e) {
            console.error('[Admin API] Error parsing JSON body:', e);
            return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { filename, content } = data;

        console.log(`[Admin API] Saving file via GitHub: ${filename}`);

        if (!filename || !content) {
            console.error('[Admin API] Missing filename or content');
            return new Response(JSON.stringify({ error: 'Missing filename or content' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate filename (security)
        if (filename.includes('..') || filename.startsWith('/')) {
            console.error('[Admin API] Invalid filename');
            return new Response(JSON.stringify({ error: 'Invalid filename' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const repoFilePath = `src/pages/blog/${filename}`;
        const localFilePath = path.join(process.cwd(), repoFilePath);
        const commitMessage = `Update article: ${filename}`;

        let savedViaGitHub = false;

        try {
            const github = getGitHubCMS();
            await github.saveFile(repoFilePath, content, commitMessage);
            savedViaGitHub = true;
            console.log(`[Admin API] File saved successfully via GitHub`);
        } catch (githubError) {
            console.warn(
                '[Admin API] GitHub save unavailable, falling back to local write:',
                githubError instanceof Error ? githubError.message : githubError,
            );
        }

        try {
            await fs.mkdir(path.dirname(localFilePath), { recursive: true });
            await fs.writeFile(localFilePath, content, 'utf-8');
            console.log(`[Admin API] Local copy saved at ${localFilePath}`);

            // Sync with Supabase
            const { supabaseAdmin } = await import('../../../lib/supabase');
            const matter = await import('gray-matter');
            const { data: frontmatter } = matter.default(content);

            const articleData = {
                slug: filename.replace('.md', ''),
                title: frontmatter.title,
                content: content,
                excerpt: frontmatter.description,
                image: frontmatter.featuredImage,
                status: 'published',
                published_at: frontmatter.pubDate ? new Date(frontmatter.pubDate).toISOString() : new Date().toISOString(),
                updated_at: new Date().toISOString(),
                affiliate_ids: frontmatter.affiliateProducts || []
            };

            const { error: supabaseError } = await supabaseAdmin
                .from('articles')
                .upsert(articleData, { onConflict: 'slug' });

            if (supabaseError) {
                console.error('[Admin API] Supabase sync error:', supabaseError);
            } else {
                console.log('[Admin API] Synced with Supabase');
            }

        } catch (localError: any) {
            if (localError?.code === 'EROFS') {
                console.warn('[Admin API] Local filesystem is read-only; skipping local save.');
            } else if (!savedViaGitHub) {
                throw localError;
            } else {
                console.warn('[Admin API] Failed to save local copy:', localError?.message ?? localError);
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: savedViaGitHub
                ? 'File tersimpan di GitHub dan salinan lokal diperbarui. Netlify akan deploy otomatis dalam ±2 menit.'
                : 'File disimpan secara lokal. Commit & deploy manual diperlukan sampai token GitHub aktif.',
            mode: savedViaGitHub ? 'github' : 'local'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('[Admin API] Error saving file:', error);
        console.error('[Admin API] Error stack:', error.stack);
        return new Response(JSON.stringify({
            error: error.message || 'Internal Server Error',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
