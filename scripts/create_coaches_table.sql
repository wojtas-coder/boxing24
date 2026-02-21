-- Migration: Create Coaches Table
-- Description: Creates a table to store coach profiles.

CREATE TABLE IF NOT EXISTS public.coaches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    title TEXT,
    image_url TEXT,
    description TEXT,
    specialties JSONB DEFAULT '[]',
    price TEXT,
    cal_link TEXT UNIQUE,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active coaches" 
    ON public.coaches FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Allow authenticated full access to coaches" 
    ON public.coaches FOR ALL 
    USING (auth.role() = 'authenticated');
