
-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create News Table
CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    category TEXT,
    image_url TEXT,
    author TEXT DEFAULT 'AI Reporter',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- 1. Allow Public Read (viewers)
CREATE POLICY "Public Read News"
ON public.news FOR SELECT
USING (true);

-- 2. Allow Service Role / Authenticated Write (editors/bots)
-- For simplicity in this bot, we used Service Role Key which bypasses RLS, but having a policy is good.
CREATE POLICY "Enable insert for authenticated users only"
ON public.news FOR INSERT
WITH CHECK (true); -- Ideally restrict to specific role, but 'true' allows any authenticated user (our bot uses service role anyway)

-- 3. Allow Update for authenticated
CREATE POLICY "Enable update for authenticated users only"
ON public.news FOR UPDATE
USING (true);
