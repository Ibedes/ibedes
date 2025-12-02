-- Trigger untuk membuat notifikasi otomatis dari article_likes dan article_comments
-- Jalankan SQL ini di Supabase SQL Editor

-- Function untuk membuat notifikasi dari like baru
CREATE OR REPLACE FUNCTION notify_new_like()
RETURNS TRIGGER AS $$
DECLARE
    article_title_text TEXT;
BEGIN
    -- Ambil judul artikel (jika ada tabel articles)
    -- Jika tidak ada, gunakan slug sebagai fallback
    article_title_text := COALESCE(NEW.slug, 'Unknown Article');
    
    -- Insert notifikasi baru
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
    -- Ambil judul artikel
    article_title_text := COALESCE(NEW.slug, 'Unknown Article');
    
    -- Truncate comment untuk preview
    comment_preview := LEFT(NEW.message, 100);
    IF LENGTH(NEW.message) > 100 THEN
        comment_preview := comment_preview || '...';
    END IF;
    
    -- Insert notifikasi baru
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

-- Verifikasi triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('article_likes', 'article_comments');
