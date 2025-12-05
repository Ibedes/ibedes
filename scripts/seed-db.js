import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars manually to avoid dependencies
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.PUBLIC_SUPABASE_URL;
const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY; // Using anon key is fine if RLS allows insert, otherwise need service role

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

// Use service role key if available for bypassing RLS, otherwise anon key
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedProducts() {
    console.log('Seeding products...');
    const productsPath = path.resolve(__dirname, '../src/data/affiliate-products.json');
    if (!fs.existsSync(productsPath)) {
        console.log('No products file found.');
        return;
    }

    const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

    // Transform data to match schema if necessary
    const formattedProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price ? parseFloat(p.price) : null,
        original_price: p.originalPrice ? parseFloat(p.originalPrice) : null,
        discount: p.discount,
        image: p.image,
        link: p.link,
        platform: p.platform,
        category: p.category,
        tags: p.tags,
        rating: p.rating,
        verified: p.verified,
        updated_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('affiliate_products').upsert(formattedProducts);

    if (error) {
        console.error('Error seeding products:', error);
    } else {
        console.log(`Successfully seeded ${products.length} products.`);
    }
}

async function seedArticles() {
    console.log('Seeding articles...');
    const blogDir = path.resolve(__dirname, '../src/pages/blog');
    if (!fs.existsSync(blogDir)) {
        console.log('No blog directory found.');
        return;
    }

    const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
    const articles = [];

    for (const file of files) {
        const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
        const { data, content: markdownContent } = matter(content);

        // Use filename as slug if not provided
        const slug = data.url ? data.url.replace('/blog/', '') : file.replace(/\.mdx?$/, '');

        articles.push({
            slug: slug,
            title: data.title,
            content: markdownContent,
            excerpt: data.description,
            image: data.featuredImage,
            status: 'published', // Assuming existing files are published
            published_at: data.pubDate ? new Date(data.pubDate).toISOString() : new Date().toISOString(),
            updated_at: new Date().toISOString(),
            affiliate_ids: data.affiliateProducts || []
        });
    }

    if (articles.length > 0) {
        // We need to handle the UUID generation or let Supabase do it.
        // Since we don't have UUIDs in the markdown, we rely on Supabase to generate them.
        // But upsert requires a primary key. Our schema has 'id' as PK (UUID).
        // If we want to update existing, we need to know the ID.
        // Since we are seeding, maybe we just insert and ignore conflicts on slug?
        // But slug is unique in our schema.

        // Let's try to upsert based on slug if possible, but our PK is ID.
        // We can query existing articles by slug to get their IDs.

        for (const article of articles) {
            const { data: existing } = await supabase.from('articles').select('id').eq('slug', article.slug).single();

            if (existing) {
                await supabase.from('articles').update(article).eq('id', existing.id);
            } else {
                await supabase.from('articles').insert(article);
            }
        }
        console.log(`Successfully processed ${articles.length} articles.`);
    } else {
        console.log('No articles found to seed.');
    }
}

async function main() {
    await seedProducts();
    await seedArticles();
    console.log('Seeding complete.');
}

main().catch(console.error);
