-- Create tables for article engagement (likes and comments)
-- Run this in Supabase SQL Editor

-- Table: article_likes
-- Menyimpan data likes untuk setiap artikel
CREATE TABLE IF NOT EXISTS article_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL,
    user_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate likes from same user on same article
    UNIQUE(slug, user_hash)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_article_likes_slug ON article_likes(slug);
CREATE INDEX IF NOT EXISTS idx_article_likes_user_hash ON article_likes(user_hash);
CREATE INDEX IF NOT EXISTS idx_article_likes_created_at ON article_likes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read likes
CREATE POLICY "Anyone can read article_likes" ON article_likes
    FOR SELECT USING (true);

-- Policy: Anyone can insert likes (for anonymous users)
CREATE POLICY "Anyone can insert article_likes" ON article_likes
    FOR INSERT WITH CHECK (true);

-- Policy: Admin can manage all likes
CREATE POLICY "Admin can manage article_likes" ON article_likes
    FOR ALL USING (auth.role() = 'authenticated');


-- Table: article_comments
-- Menyimpan data komentar untuk setiap artikel
CREATE TABLE IF NOT EXISTS article_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Anonim',
    message TEXT NOT NULL,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'pending', 'spam')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_article_comments_slug ON article_comments(slug);
CREATE INDEX IF NOT EXISTS idx_article_comments_status ON article_comments(status);
CREATE INDEX IF NOT EXISTS idx_article_comments_created_at ON article_comments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published comments
CREATE POLICY "Anyone can read published comments" ON article_comments
    FOR SELECT USING (status = 'published');

-- Policy: Anyone can insert comments (for anonymous users)
CREATE POLICY "Anyone can insert comments" ON article_comments
    FOR INSERT WITH CHECK (true);

-- Policy: Admin can manage all comments
CREATE POLICY "Admin can manage all comments" ON article_comments
    FOR ALL USING (auth.role() = 'authenticated');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_article_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_article_comments_updated_at_trigger ON article_comments;
CREATE TRIGGER update_article_comments_updated_at_trigger
    BEFORE UPDATE ON article_comments
    FOR EACH ROW EXECUTE FUNCTION update_article_comments_updated_at();

-- Verify tables created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('article_likes', 'article_comments');
