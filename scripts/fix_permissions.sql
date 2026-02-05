-- 1. DROP EXISTING POLICIES TO AVOID CONFLICTS
DROP POLICY IF EXISTS "Enable read access for all users" ON news;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON news;
DROP POLICY IF EXISTS "Enable update for authors only" ON news;
DROP POLICY IF EXISTS "Enable delete for authors only" ON news;

-- 2. CREATE PERMISSIVE POLICIES FOR NEWS
-- Allow EVERYONE to read news (public website needs it)
CREATE POLICY "Public can view news" ON news FOR SELECT USING (true);

-- Allow ADMINS (and authors) to full access
CREATE POLICY "Admins full access news" ON news FOR ALL USING (
    is_admin(auth.uid()) OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- 3. ENSURE DATA EXISTS
INSERT INTO news (title, slug, excerpt, content, author, category, published_at, image_url)
VALUES 
('Witaj w nowym panelu', 'witaj-panel', 'To jest przykładowy news.', '<p>System działa poprawnie.</p>', 'Redakcja', 'SYSTEM', now(), 'https://images.unsplash.com/photo-1552072092-2849f5f2413d?w=800&auto=format&fit=crop')
ON CONFLICT DO NOTHING;

-- 4. FIX PROFILES RLS (Often causes 'loading' issues on Users tab)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Admins view all profiles" ON profiles FOR SELECT USING (
    is_admin(auth.uid()) OR auth.uid() = id
);
