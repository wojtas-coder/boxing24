-- Create subscribers table
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Policies for subscribers
-- 1. Anyone can insert (sign up)
CREATE POLICY "Enable insert for all users" ON public.subscribers
    FOR INSERT WITH CHECK (true);

-- 2. Only admins can view the list
-- We assume admin is someone with a matching email in an admin list or just check auth for now
-- For boxing24, we usually check if the user is authenticated and has an admin-like role in profiles
CREATE POLICY "Enable select for authenticated admins only" ON public.subscribers
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND 
            (role = 'admin' OR role = 'coach')
        )
    );

-- 3. Only admins can update
CREATE POLICY "Enable update for authenticated admins only" ON public.subscribers
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND 
            (role = 'admin' OR role = 'coach')
        )
    );

-- 4. Only admins can delete
CREATE POLICY "Enable delete for authenticated admins only" ON public.subscribers
    FOR DELETE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND 
            (role = 'admin' OR role = 'coach')
        )
    );
