CREATE TABLE IF NOT EXISTS public.knowledge_articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    image_url TEXT,
    author_name TEXT DEFAULT 'Redakcja Boxing24',
    reading_time_min INTEGER DEFAULT 5,
    difficulty_level TEXT DEFAULT 'Pocz¹tkuj¹cy',
    is_premium BOOLEAN DEFAULT false,
    has_dual_version BOOLEAN DEFAULT false,
    free_content TEXT,
    premium_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;

-- Create policies (open for now for admin panel, restricted for read on frontend if needed, but assuming standard setup like news)
CREATE POLICY ""Zezwól na odczyt wszystkim (Knowledge)"" ON public.knowledge_articles FOR SELECT USING (true);
CREATE POLICY ""Zezwól na wszystko adminom (Knowledge)"" ON public.knowledge_articles FOR ALL USING (true) WITH CHECK (true);
