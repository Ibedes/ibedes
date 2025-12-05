import type { ArticleFrontmatter } from "./types";
import { getShortDescription } from "./utils";
import { supabaseAdmin } from "./supabase";

/**
 * Fetch articles from Supabase database
 * This is used in production where filesystem is read-only
 */
export async function getArticlesFromDatabase() {
    try {
        const { data, error } = await supabaseAdmin
            .from('articles')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (error) {
            console.error('[Database] Error fetching articles:', error);
            return [];
        }

        return data.map((article) => {
            // Parse frontmatter from content if available
            let frontmatter: any = {};
            try {
                const matter = require('gray-matter');
                const parsed = matter(article.content || '');
                frontmatter = parsed.data;
            } catch (e) {
                console.warn('[Database] Could not parse frontmatter for:', article.slug);
            }

            const shortDescription = getShortDescription(
                article.excerpt || frontmatter.description || ''
            );

            return {
                title: article.title || frontmatter.title || 'Untitled',
                description: shortDescription,
                tags: frontmatter.tags || [],
                time: frontmatter.time || 5,
                featured: frontmatter.featured || false,
                timestamp: article.published_at || new Date().toISOString(),
                filename: `/blog/${article.slug}`,
            };
        });
    } catch (error) {
        console.error('[Database] Fatal error fetching articles:', error);
        return [];
    }
}

/**
 * Get a single article from database by slug
 */
export async function getArticleFromDatabase(slug: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('articles')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error) {
            console.error('[Database] Error fetching article:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('[Database] Fatal error fetching article:', error);
        return null;
    }
}
