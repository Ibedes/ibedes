import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

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

        console.log(`[Admin API] Saving article: ${filename}`);

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

        const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';
        const repoFilePath = `src/content/blog/${filename}`;
        const localFilePath = path.join(process.cwd(), repoFilePath);

        let savedLocally = false;

        // Try to save to local filesystem (only in development or if writable)
        if (!isProduction) {
            try {
                await fs.mkdir(path.dirname(localFilePath), { recursive: true });
                await fs.writeFile(localFilePath, content, 'utf-8');
                savedLocally = true;
                console.log(`[Admin API] Local file saved at ${localFilePath}`);
            } catch (localError: any) {
                if (localError?.code === 'EROFS') {
                    console.warn('[Admin API] Filesystem is read-only, skipping local save.');
                } else {
                    console.error('[Admin API] Error saving local file:', localError);
                    // Don't throw, continue to Supabase save
                }
            }
        } else {
            console.log('[Admin API] Production mode: skipping local filesystem save');
        }

        // Always sync with Supabase (if configured)
        try {
            const { supabaseAdmin, hasSupabaseConfig } = await import('../../../lib/supabase');
            const matter = await import('gray-matter');
            const { data: frontmatter } = matter.default(content);

            if (hasSupabaseConfig && supabaseAdmin) {
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
                    const friendly =
                        supabaseError.message?.includes('affiliate_ids') ||
                        supabaseError.details?.includes('affiliate_ids')
                            ? 'Kolom affiliate_ids belum ada di tabel articles. Jalankan migrasi db/migration_update.sql pada Supabase.'
                            : supabaseError.message;
                    throw new Error(`Gagal menyimpan ke database: ${friendly}`);
                }

                console.log('[Admin API] Synced with Supabase');
            } else {
                console.warn('[Admin API] Supabase config missing, skipping DB sync. Content saved locally only.');
            }

        } catch (supabaseError: any) {
            console.error('[Admin API] Error syncing with Supabase:', supabaseError);
            // If we already saved the file locally, return a soft warning instead of hard failing
            if (!isProduction && savedLocally) {
                return new Response(JSON.stringify({
                    success: true,
                    message: 'Artikel tersimpan ke file lokal, namun gagal sinkron ke database. Cek konfigurasi Supabase.',
                    mode: 'local-only',
                    warning: supabaseError.message,
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            throw supabaseError;
        }

        const message = isProduction
            ? 'Article berhasil disimpan ke database. File lokal akan diupdate saat rebuild/deploy berikutnya.'
            : savedLocally
                ? 'Article berhasil disimpan ke file lokal dan database. Jangan lupa commit dan push untuk deploy.'
                : 'Article berhasil disimpan ke database. File lokal tidak dapat diupdate (read-only filesystem).';

        return new Response(JSON.stringify({
            success: true,
            message: message,
            mode: isProduction ? 'production' : (savedLocally ? 'local+db' : 'db-only')
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
