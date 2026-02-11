-- Comprehensive Column Fix for 'news' table
-- This script safely adds columns if they are missing

DO $$
BEGIN
    -- Check and add 'author_name'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='author_name') THEN
        ALTER TABLE news ADD COLUMN author_name TEXT DEFAULT 'Redakcja';
    END IF;

    -- Check and add 'is_breaking'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='is_breaking') THEN
        ALTER TABLE news ADD COLUMN is_breaking BOOLEAN DEFAULT false;
    END IF;

    -- Check and add 'source_link'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='source_link') THEN
        ALTER TABLE news ADD COLUMN source_link TEXT;
    END IF;

    -- Check and add 'image_url' (just in case)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='image_url') THEN
        ALTER TABLE news ADD COLUMN image_url TEXT;
    END IF;
    
    -- Check and add 'lead' (just in case)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='lead') THEN
        ALTER TABLE news ADD COLUMN lead TEXT;
    END IF;
    
    -- Check and add 'category' (just in case)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='category') THEN
        ALTER TABLE news ADD COLUMN category TEXT DEFAULT 'Boks Zawodowy';
    END IF;

END $$;

-- Verify all columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'news';
