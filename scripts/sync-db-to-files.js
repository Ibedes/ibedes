#!/usr/bin/env node

/**
 * Sync database articles to local files
 * This script will:
 * 1. Get all published articles from Supabase
 * 2. Create/update local .md files in src/content/blog/
 * 3. Report what was created/updated
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../src/content/blog');

// Load environment variables
config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
    console.log('\nPlease set it in your .env file or run:');
    console.log('export SUPABASE_SERVICE_ROLE_KEY=your_key_here\n');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncDbToFiles() {
    console.log('🔄 Starting sync from database to files...\n');

    try {
        // 1. Get all published articles from Supabase
        const { data: articles, error } = await supabase
            .from('articles')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch articles from Supabase: ${error.message}`);
        }

        console.log(`📊 Found ${articles.length} published articles in database`);

        // 2. Ensure blog directory exists
        await fs.mkdir(BLOG_DIR, { recursive: true });

        // 3. Create/update files
        let created = 0;
        let updated = 0;

        for (const article of articles) {
            const filename = `${article.slug}.md`;
            const filePath = path.join(BLOG_DIR, filename);

            // Create frontmatter
            const frontmatter = {
                title: article.title,
                description: article.excerpt || '',
                pubDate: article.published_at || article.created_at,
                tags: [], // Could be extracted from content if needed
                featuredImage: article.image,
                time: 5, // Default reading time
                featured: false // Default
            };

            // Create markdown content
            const yamlFrontmatter = Object.entries(frontmatter)
                .filter(([_, value]) => value !== null && value !== undefined && value !== '')
                .map(([key, value]) => {
                    if (Array.isArray(value)) {
                        return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
                    }
                    if (typeof value === 'string' && value.includes('\n')) {
                        return `${key}: |\n${value.split('\n').map(line => `  ${line}`).join('\n')}`;
                    }
                    if (typeof value === 'boolean' || typeof value === 'number') {
                        return `${key}: ${value}`;
                    }
                    return `${key}: "${value}"`;
                })
                .join('\n');

            const markdownContent = `---\n${yamlFrontmatter}\n---\n\n${article.content || ''}`;

            // Check if file exists
            let exists = false;
            try {
                await fs.access(filePath);
                exists = true;
            } catch { }

            // Write file
            await fs.writeFile(filePath, markdownContent, 'utf-8');

            if (exists) {
                console.log(`   ✏️  Updated: ${filename}`);
                updated++;
            } else {
                console.log(`   ➕ Created: ${filename}`);
                created++;
            }
        }

        console.log(`\n✅ Sync complete! Created ${created} files, updated ${updated} files.\n`);
        console.log('📝 Next steps:');
        console.log('   1. Review the changes');
        console.log('   2. Test in development mode');
        console.log('   3. Commit and push if satisfied\n');

    } catch (error) {
        console.error('❌ Error during sync:', error.message);
        process.exit(1);
    }
}

// Run the sync
syncDbToFiles();