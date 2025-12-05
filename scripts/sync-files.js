#!/usr/bin/env node

/**
 * Sync local markdown files with Supabase database
 * This script will:
 * 1. Get all articles from Supabase
 * 2. Get all .md files in src/pages/blog/
 * 3. Delete local files that don't exist in Supabase
 * 4. Report what was deleted
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

// Import Supabase client directly
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../src/content/blog');

// Load environment variables from .env file
config();

// Initialize Supabase client
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || 'https://xqwfqnqvvdqhgbgfqjmq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
    console.log('\nPlease set it in your .env file or run:');
    console.log('export SUPABASE_SERVICE_ROLE_KEY=your_key_here\n');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncFiles() {
    console.log('🔄 Starting sync...\n');

    try {
        // 1. Get all published articles from Supabase
        const { data: articles, error } = await supabase
            .from('articles')
            .select('slug')
            .eq('status', 'published');

        if (error) {
            throw new Error(`Failed to fetch articles from Supabase: ${error.message}`);
        }

        const dbSlugs = new Set(articles.map(a => a.slug));
        console.log(`📊 Found ${dbSlugs.size} articles in Supabase database`);

        // 2. Get all .md files in blog directory
        const files = await fs.readdir(BLOG_DIR);
        const mdFiles = files.filter(f => f.endsWith('.md'));
        console.log(`📁 Found ${mdFiles.length} markdown files in local filesystem\n`);

        // 3. Find files to delete (exist locally but not in database)
        const filesToDelete = [];
        for (const file of mdFiles) {
            const slug = file.replace('.md', '');
            if (!dbSlugs.has(slug)) {
                filesToDelete.push(file);
            }
        }

        // 4. Delete orphaned files
        if (filesToDelete.length === 0) {
            console.log('✅ All files are in sync! Nothing to delete.\n');
            return;
        }

        console.log(`🗑️  Found ${filesToDelete.length} file(s) to delete:\n`);

        for (const file of filesToDelete) {
            const filePath = path.join(BLOG_DIR, file);
            console.log(`   ❌ Deleting: ${file}`);
            await fs.unlink(filePath);
        }

        console.log(`\n✅ Sync complete! Deleted ${filesToDelete.length} file(s).\n`);
        console.log('📝 Next steps:');
        console.log('   1. Review the changes');
        console.log('   2. git add .');
        console.log('   3. git commit -m "chore: sync deleted articles from database"');
        console.log('   4. git push origin main');
        console.log('   5. Deploy to production\n');

    } catch (error) {
        console.error('❌ Error during sync:', error.message);
        process.exit(1);
    }
}

// Run the sync
syncFiles();
