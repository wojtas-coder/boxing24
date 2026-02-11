-- Add author_name to existing table if missing
ALTER TABLE news ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'Redakcja';

-- Verify columns
SELECT column_name FROM information_schema.columns WHERE table_name = 'news';
