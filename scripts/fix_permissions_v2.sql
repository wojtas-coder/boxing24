-- ==================================================
-- NAPRAWA UPRAWNIEŃ (RLS) - "NUCLEAR FIX" v2
-- ==================================================

-- 1. Funkcja sprawdzająca Admina (SECURITY DEFINER = omija blokady)
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = user_id AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Naprawa tabeli PROFILES (Użytkownicy)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles view" ON profiles;

-- Każdy widzi swój profil
CREATE POLICY "Users can view own profile" ON profiles 
    FOR SELECT USING (auth.uid() = id);

-- Admin widzi WSZYSTKIE profile
CREATE POLICY "Admins view all profiles" ON profiles 
    FOR SELECT USING (is_admin(auth.uid()));

-- Admin może edytować WSZYSTKIE profile (nadawać role)
CREATE POLICY "Admins update all profiles" ON profiles 
    FOR UPDATE USING (is_admin(auth.uid()));


-- 3. Naprawa tabeli NEWS (Newsroom)
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view news" ON news;
DROP POLICY IF EXISTS "Admins manage news" ON news;

-- Każdy widzi newsy (strona główna)
CREATE POLICY "Public view news" ON news 
    FOR SELECT USING (true);

-- Admin pełny dostęp (widzi, dodaje, usuwa)
CREATE POLICY "Admins manage news" ON news 
    FOR ALL USING (is_admin(auth.uid()));


-- 4. Upewnienie się, że Twój użytkownik JEST adminem
-- (Zastąp swoim e-mailem jeśli jest inny, ale to powinno zadziałać dla zalogowanego)
UPDATE profiles 
SET role = 'admin' 
WHERE id = auth.uid(); 
