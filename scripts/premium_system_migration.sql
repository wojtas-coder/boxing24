-- =============================================
-- BOXING24: Premium System Migration (Stripe-Ready)
-- Run in Supabase SQL Editor
-- =============================================

-- 1. ADD STRIPE-READY COLUMNS TO PROFILES
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS membership_tier text DEFAULT 'free'; -- 'free', 'starter', 'pro', 'elite'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'none'; -- 'none', 'active', 'past_due', 'canceled', 'trialing'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 2. FIX AUTO-CREATE PROFILE TRIGGER (includes email now)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, membership_status, membership_tier, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'client',
    'Free',
    'free',
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(profiles.full_name, ''), EXCLUDED.full_name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. BACKFILL: Create profiles for existing auth users who don't have one
INSERT INTO profiles (id, email, full_name, role, membership_status, membership_tier, created_at)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
    'client',
    'Free',
    'free',
    u.created_at
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- 4. SYNC: Add email to existing profiles that are missing it
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- 5. GRANT YOUR ACCOUNT ADMIN + PREMIUM
UPDATE profiles 
SET 
    role = 'admin',
    membership_status = 'member',
    membership_tier = 'elite'
WHERE id = 'e1679220-0798-471b-912e-b1e861e3c30c';

-- 6. RLS: Allow admins to update any profile (needed for admin panel)
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 7. VERIFY
SELECT id, email, full_name, role, membership_status, membership_tier, created_at 
FROM profiles 
ORDER BY created_at DESC;
