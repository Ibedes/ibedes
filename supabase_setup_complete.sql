-- ============================================================================
-- SETUP LENGKAP SISTEM NOTIFIKASI IBEDES
-- ============================================================================
-- Jalankan file SQL ini di Supabase SQL Editor untuk setup lengkap
-- File ini menggabungkan:
-- 1. Tabel article_likes dan article_comments
-- 2. Tabel notifications
-- 3. Triggers untuk auto-notification
-- ============================================================================

-- ============================================================================
-- PART 1: TABEL ENGAGEMENT (LIKES & COMMENTS)
-- ============================================================================

-- Table: article_likes
CREATE TABLE IF NOT EXISTS article_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL,
    user_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(slug, user_hash)
);

CREATE INDEX IF NOT EXISTS idx_article_likes_slug ON article_likes(slug);
CREATE INDEX IF NOT EXISTS idx_article_likes_user_hash ON article_likes(user_hash);
CREATE INDEX IF NOT EXISTS idx_article_likes_created_at ON article_likes(created_at DESC);

ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read article_likes" ON article_likes
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert article_likes" ON article_likes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can manage article_likes" ON article_likes
    FOR ALL USING (auth.role() = 'authenticated');

-- Table: article_comments
CREATE TABLE IF NOT EXISTS article_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Anonim',
    message TEXT NOT NULL,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'pending', 'spam')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_comments_slug ON article_comments(slug);
CREATE INDEX IF NOT EXISTS idx_article_comments_status ON article_comments(status);
CREATE INDEX IF NOT EXISTS idx_article_comments_created_at ON article_comments(created_at DESC);

ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published comments" ON article_comments
    FOR SELECT USING (status = 'published');

CREATE POLICY "Anyone can insert comments" ON article_comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can manage all comments" ON article_comments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION update_article_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_article_comments_updated_at_trigger ON article_comments;
CREATE TRIGGER update_article_comments_updated_at_trigger
    BEFORE UPDATE ON article_comments
    FOR EACH ROW EXECUTE FUNCTION update_article_comments_updated_at();

-- ============================================================================
-- PART 2: TABEL NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('newsletter', 'like', 'comment', 'bookmark')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage notifications" ON notifications
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Anonymous can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anonymous can read notifications" ON notifications
    FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 3: TRIGGERS UNTUK AUTO-NOTIFICATION
-- ============================================================================

-- Function untuk membuat notifikasi dari like baru
CREATE OR REPLACE FUNCTION notify_new_like()
RETURNS TRIGGER AS $$
DECLARE
    article_title_text TEXT;
BEGIN
    article_title_text := COALESCE(NEW.slug, 'Unknown Article');
    
    INSERT INTO notifications (
        type,
        title,
        message,
        metadata,
        timestamp,
        read
    ) VALUES (
        'like',
        '❤️ Like Baru',
        'Artikel "' || article_title_text || '" mendapat like',
        jsonb_build_object(
            'articleSlug', NEW.slug,
            'articleTitle', article_title_text,
            'userHash', NEW.user_hash
        ),
        NOW(),
        false
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function untuk membuat notifikasi dari komentar baru
CREATE OR REPLACE FUNCTION notify_new_comment()
RETURNS TRIGGER AS $$
DECLARE
    article_title_text TEXT;
    comment_preview TEXT;
BEGIN
    article_title_text := COALESCE(NEW.slug, 'Unknown Article');
    
    comment_preview := LEFT(NEW.message, 100);
    IF LENGTH(NEW.message) > 100 THEN
        comment_preview := comment_preview || '...';
    END IF;
    
    INSERT INTO notifications (
        type,
        title,
        message,
        metadata,
        timestamp,
        read
    ) VALUES (
        'comment',
        '💬 Komentar Baru',
        'Komentar baru di "' || article_title_text || '"',
        jsonb_build_object(
            'articleSlug', NEW.slug,
            'articleTitle', article_title_text,
            'commentText', comment_preview,
            'userHash', COALESCE(NEW.name, 'Anonim')
        ),
        NOW(),
        false
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_article_like_insert ON article_likes;
DROP TRIGGER IF EXISTS on_article_comment_insert ON article_comments;

-- Create trigger untuk article_likes
CREATE TRIGGER on_article_like_insert
    AFTER INSERT ON article_likes
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_like();

-- Create trigger untuk article_comments
CREATE TRIGGER on_article_comment_insert
    AFTER INSERT ON article_comments
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_comment();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Cek semua tabel sudah dibuat
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('article_likes', 'article_comments', 'notifications')
ORDER BY table_name;

-- Cek semua triggers sudah aktif
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('article_likes', 'article_comments', 'notifications')
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- TEST DATA (Optional - uncomment untuk testing)
-- ============================================================================

-- Test: Insert like (akan trigger notifikasi otomatis)
-- INSERT INTO article_likes (slug, user_hash)
-- VALUES ('test-article', 'test-user-123');

-- Test: Insert comment (akan trigger notifikasi otomatis)
-- INSERT INTO article_comments (slug, name, message, status)
-- VALUES ('test-article', 'Test User', 'Ini adalah komentar test!', 'published');

-- Cek notifikasi yang dibuat
-- SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 5;

-- ============================================================================
-- SELESAI!
-- ============================================================================
-- Setup lengkap sudah selesai. Silakan test dengan:
-- 1. Like artikel dari frontend
-- 2. Comment artikel dari frontend
-- 3. Cek notifikasi di /admin/dashboard
-- ============================================================================
