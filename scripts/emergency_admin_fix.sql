-- ============================================
-- NAPRAWA ADMINA - WKLEJ CAŁOŚĆ W SUPABASE SQL EDITOR
-- ============================================

-- Wyłącz RLS na tabelach (przywraca pełny dostęp)
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS news DISABLE ROW LEVEL SECURITY;

-- Tabele które mogą nie istnieć - ignoruj błędy
DO $$ BEGIN ALTER TABLE ads DISABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE bookings DISABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE messages DISABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- Upewnij się że Twój profil istnieje z rolą admin
INSERT INTO profiles (id, full_name, role, membership_status)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'wojtekrewczuk@gmail.com' LIMIT 1),
    'Wojciech Rewczuk',
    'admin',
    'member'
)
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin', 
    membership_status = 'member';

-- Sprawdzenie - powinno zwrócić Twój profil z role=admin
SELECT id, full_name, role, membership_status FROM profiles WHERE role = 'admin';
