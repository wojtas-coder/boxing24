-- ============================================
-- EMERGENCY FIX: Admin Panel Infinite Loading
-- Run this in Supabase SQL Editor NOW
-- ============================================

-- STEP 1: Create your admin profile (if missing)
INSERT INTO profiles (id, full_name, role, membership_status)
VALUES ('e1679220-0798-471b-912e-b1e861e3c30c', 'Wojciech Rewczuk', 'admin', 'member')
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin', 
    membership_status = 'member';

-- STEP 2: Temporarily disable RLS to test if that's the issue
-- (You can re-enable later after confirming admin panel works)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE news DISABLE ROW LEVEL SECURITY;

-- Optional: Check if analytics_events table exists and disable RLS
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'analytics_events') THEN
        ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- STEP 3: Verify your profile exists
SELECT id, email, full_name, role, membership_status 
FROM profiles 
WHERE id = 'e1679220-0798-471b-912e-b1e861e3c30c';

-- STEP 4: Test query that admin dashboard runs
SELECT COUNT(*) as user_count FROM profiles;
SELECT COUNT(*) as news_count FROM news;

-- After confirming admin panel works, you can re-enable RLS with better policies:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE news ENABLE ROW LEVEL SECURITY;
