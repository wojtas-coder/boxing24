-- Skrypt Naprawczy: Odblokowanie Panelu Admina dla logowania SiteLock (Anon)

-- CO ROBI TEN SKRYPT:
-- Ponieważ logujesz się do Panelu Admina hasłem pobocznym (SiteLock 'boxing2420'), 
-- a nie natywnym kontem e-mail Supabase, baza danych traktuje Twoje żądania jako 
-- "Anonimowe" i blokuje dodawanie/usuwanie danych ze względów bezpieczeństwa (RLS).
-- Ten skrypt mówi bazie: "Pozwól na dodawanie/edycję bez logowania e-mailowego".

-- Tabela: COACHES
DROP POLICY IF EXISTS "Allow authenticated full access to coaches" ON public.coaches;
DROP POLICY IF EXISTS "Allow public read access to active coaches" ON public.coaches;
CREATE POLICY "Allow public full access to coaches" ON public.coaches FOR ALL USING (true) WITH CHECK (true);

-- Tabela: MEMBERSHIPS
DROP POLICY IF EXISTS "Allow authenticated full access to memberships" ON public.memberships;
DROP POLICY IF EXISTS "Allow public read access to active memberships" ON public.memberships;
CREATE POLICY "Allow public full access to memberships" ON public.memberships FOR ALL USING (true) WITH CHECK (true);

-- Tabela: NEWS
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.news;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.news;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.news;
CREATE POLICY "Allow public full access to news" ON public.news FOR ALL USING (true) WITH CHECK (true);

-- Tabela: KNOWLEDGE
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.knowledge;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.knowledge;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.knowledge;
CREATE POLICY "Allow public full access to knowledge" ON public.knowledge FOR ALL USING (true) WITH CHECK (true);

-- Czasami Vercel wymaga również uprawnień do tabeli Media / Ads (jeśli dodałeś RLS tam)
-- DROP POLICY IF EXISTS "Allow authenticated full access to media" ON public.media;
-- CREATE POLICY "Allow public full access to media" ON public.media FOR ALL USING (true) WITH CHECK (true);
