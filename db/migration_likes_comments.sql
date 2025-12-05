-- Create article_likes table
CREATE TABLE IF NOT EXISTS article_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT NOT NULL,
    user_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone" 
ON article_likes FOR SELECT 
USING (true);

CREATE POLICY "Everyone can insert likes" 
ON article_likes FOR INSERT 
WITH CHECK (true);

-- Create article_comments table
CREATE TABLE IF NOT EXISTS article_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT NOT NULL,
    name TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" 
ON article_comments FOR SELECT 
USING (status = 'published');

CREATE POLICY "Everyone can insert comments" 
ON article_comments FOR INSERT 
WITH CHECK (true);
