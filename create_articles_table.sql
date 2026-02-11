
-- Create the articles table for the knowledge base
CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    category TEXT,
    author TEXT,
    title TEXT NOT NULL,
    excerpt TEXT,
    image TEXT,
    is_premium BOOLEAN DEFAULT false,
    has_dual_version BOOLEAN DEFAULT false,
    free_content TEXT,
    premium_content TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON articles FOR SELECT USING (true);

-- Allow authenticated users to perform all actions
CREATE POLICY "Allow auth all access" ON articles FOR ALL USING (auth.role() = 'authenticated');
