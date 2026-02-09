-- CRITICAL FIX: Row Level Security (RLS) & Permissions

-- 1. Enable reading Profiles for Authenticated Users (essential for Admin/Coach)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true); 

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. Training Plans Policies
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Coaches can CRUD their own plans" ON training_plans;
DROP POLICY IF EXISTS "Everyone can read public plans" ON training_plans;

CREATE POLICY "Coaches can CRUD their own plans"
ON training_plans
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Everyone can read public plans"
ON training_plans FOR SELECT
USING (is_public = true);

-- 3. Fix Bookings RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Public read bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can insert booking" ON bookings;
DROP POLICY IF EXISTS "Coaches can update their bookings" ON bookings;

CREATE POLICY "Public read bookings"
ON bookings FOR SELECT
USING (true); 

CREATE POLICY "Anyone can insert booking"
ON bookings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Coaches can update their bookings"
ON bookings FOR UPDATE
USING (true);

-- 4. Fix Training Plans Table (Add JSONB schedule if missing, usually handled by v3)
-- ensure content exists.
