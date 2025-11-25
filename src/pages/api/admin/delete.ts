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

        const { filename } = data;

        console.log(`[Admin API] Deleting file via GitHub: ${filename}`);

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

        const repoFilePath = `src/pages/blog/${filename}`;
        const localFilePath = path.join(process.cwd(), repoFilePath);
        const commitMessage = `Delete article: ${filename}`;

        let deletedViaGitHub = false;

        try {
            const github = getGitHubCMS();
            await github.deleteFile(repoFilePath, commitMessage);
            deletedViaGitHub = true;
            console.log(`[Admin API] File deleted successfully via GitHub`);
        } catch (githubError: any) {
            if (githubError?.status === 404) {
                console.warn('[Admin API] GitHub file not found, falling back to local delete.');
            } else {
                console.warn('[Admin API] GitHub delete failed, falling back to local delete:', githubError?.message ?? githubError);
            }
        }

        let deletedLocally = false;
        try {
            await fs.unlink(localFilePath);
            deletedLocally = true;
            console.log(`[Admin API] Local file deleted at ${localFilePath}`);
        } catch (localError: any) {
            if (localError?.code === 'ENOENT') {
                // Nothing to delete locally
            } else if (localError?.code === 'EROFS') {
                console.warn('[Admin API] Local filesystem is read-only; skipping local delete.');
            } else {
                console.error('[Admin API] Error deleting local file:', localError);
                if (!deletedViaGitHub) throw localError;
            }
        }

        if (!deletedViaGitHub && !deletedLocally) {
            throw new Error('Unable to delete article on GitHub or local filesystem.');
        }

        return new Response(JSON.stringify({
            success: true,
            message: deletedViaGitHub
                ? 'File deleted via GitHub dan salinan lokal dibersihkan.'
                : 'File lokal dihapus. Commit manual diperlukan untuk sinkronisasi.',
            mode: deletedViaGitHub ? 'github' : 'local'
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
