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

        const { filename } = data;

        console.log(`[Admin API] Deleting article: ${filename}`);

        if (!filename) {
            console.error('[Admin API] Missing filename');
            return new Response(JSON.stringify({ error: 'Missing filename' }), {
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
        // Opt-in to keep filesystem delete enabled during `npm run preview`
        const allowLocalWrite = process.env.PREVIEW_ALLOW_FS === 'true';
        const repoFilePath = `src/content/blog/${filename}`;
        const localFilePath = path.join(process.cwd(), repoFilePath);

        let deletedLocally = false;

        // Try to delete local file (only in development or if writable)
        if (!isProduction || allowLocalWrite) {
            try {
                await fs.unlink(localFilePath);
                deletedLocally = true;
                console.log(`[Admin API] Local file deleted at ${localFilePath}`);
            } catch (localError: any) {
                if (localError?.code === 'ENOENT') {
                    console.warn('[Admin API] File not found locally, continuing with database delete.');
                } else if (localError?.code === 'EROFS') {
                    console.warn('[Admin API] Filesystem is read-only, skipping local delete.');
                } else {
                    console.error('[Admin API] Error deleting local file:', localError);
                    // Don't throw, continue to Supabase delete
                }
            }
        } else {
            console.log('[Admin API] Production mode: skipping local filesystem delete');
        }

        // Always delete from Supabase
        try {
            const { supabaseAdmin, hasSupabaseConfig } = await import('../../../lib/supabase');

            if (!hasSupabaseConfig || !supabaseAdmin) {
                console.error('[Admin API] Supabase admin client is not configured');
                return new Response(JSON.stringify({ error: 'Supabase admin client is not configured' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const slug = filename.replace(/\.(md|mdx)$/i, '');

            const { error: supabaseError } = await supabaseAdmin
                .from('articles')
                .delete()
                .eq('slug', slug);

            if (supabaseError) {
                console.error('[Admin API] Supabase delete error:', supabaseError);
                const friendly = supabaseError.message?.toLowerCase().includes('row level security') ||
                    supabaseError.message?.toLowerCase().includes('permission')
                    ? 'SUPABASE_SERVICE_ROLE_KEY belum atau salah. Pastikan key service role terisi di .env / environment.'
                    : supabaseError.message;
                throw new Error(`Gagal menghapus dari database: ${friendly}`);
            } else {
                console.log('[Admin API] Deleted from Supabase');
            }
        } catch (supabaseError: any) {
            console.error('[Admin API] Error deleting from Supabase:', supabaseError);
            throw supabaseError;
        }

        const message = isProduction && !allowLocalWrite
            ? 'Article berhasil dihapus dari database. File lokal akan dihapus saat rebuild/deploy berikutnya.'
            : deletedLocally
                ? 'Article berhasil dihapus dari file lokal dan database. Jangan lupa commit dan push untuk deploy.'
                : 'Article berhasil dihapus dari database. File lokal tidak dapat dihapus (read-only filesystem).';

        return new Response(JSON.stringify({
            success: true,
            message: message,
            mode: isProduction && !allowLocalWrite ? 'production' : (deletedLocally ? 'local+db' : 'db-only')
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('[Admin API] Error deleting file:', error);
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
