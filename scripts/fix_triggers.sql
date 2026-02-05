-- ==========================================
-- NAPRAWA TRIGGERÓW I PROFILI (FIX USERS)
-- ==========================================

-- 1. Upewnij się, że trigger istnieje i działa
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email), 
    new.raw_user_meta_data->>'avatar_url', 
    'client'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Przypisz trigger do tabeli auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. RETRO-FIX (Napraw istniejących użytkowników bez profili)
-- To "dopycha" brakujące profile dla kont, które zarejestrowały się, gdy system nie działał.
INSERT INTO public.profiles (id, full_name, role, membership_status)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', email), 
    'client', 
    'Free'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;


-- 3. Potwierdzenie (powinno zwrócić liczbę wszystkich userów)
SELECT count(*) as total_users_in_auth FROM auth.users;
SELECT count(*) as total_profiles_in_db FROM public.profiles;
