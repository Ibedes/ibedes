-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Affiliate Products Table
CREATE TABLE IF NOT EXISTS affiliate_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    original_price NUMERIC,
    discount TEXT,
    image TEXT,
    link TEXT,
    platform TEXT,
    category TEXT,
    tags TEXT[],
    rating NUMERIC,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for affiliate_products
ALTER TABLE affiliate_products ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view products
CREATE POLICY "Public products are viewable by everyone" 
ON affiliate_products FOR SELECT 
USING (true);

-- Policy: Only authenticated users (admins) can insert/update/delete
-- Assuming service role or specific admin role. For now, let's allow authenticated users.
CREATE POLICY "Authenticated users can modify products" 
ON affiliate_products FOR ALL 
USING (auth.role() = 'authenticated');


-- 2. Profiles Table (for Admin/User roles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid error on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. Articles Table
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    image TEXT,
    author_id UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles are viewable by everyone" 
ON articles FOR SELECT 
USING (status = 'published');

CREATE POLICY "Admins can view all articles" 
ON articles FOR SELECT 
USING (auth.role() = 'authenticated'); -- Refine this if you have specific admin check

CREATE POLICY "Admins can insert/update/delete articles" 
ON articles FOR ALL 
USING (auth.role() = 'authenticated');


-- 4. Article Likes Table (matches frontend)
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

-- 5. Article Comments Table (matches frontend)
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


-- 5. Notifications Table (for the existing notification system)
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    metadata JSONB,
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Only admins should see notifications
CREATE POLICY "Admins can view notifications" 
ON notifications FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can modify notifications" 
ON notifications FOR ALL 
USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_affiliate_products_updated_at ON affiliate_products;
CREATE TRIGGER update_affiliate_products_updated_at
    BEFORE UPDATE ON affiliate_products
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
