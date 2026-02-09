-- =============================================
-- BOXING24 EMPIRE DATABASE INITIALIZATION (FIXED)
-- =============================================

-- 0. HELPER FUNCTION: IS_ADMIN
-- (Essential for RLS policies)
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = user_id AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 1. ADS SYSTEM (Reklamy)
CREATE TABLE IF NOT EXISTS ads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text,
    image_url text NOT NULL,
    link_url text,
    position text DEFAULT 'sidebar', -- 'sidebar', 'header', 'footer', 'popup'
    is_active boolean DEFAULT true,
    views_count int DEFAULT 0,
    clicks_count int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
-- Policy: Public can view active ads
DROP POLICY IF EXISTS "Public can view active ads" ON ads;
CREATE POLICY "Public can view active ads" ON ads FOR SELECT USING (is_active = true);
-- Policy: Admins manage ads
DROP POLICY IF EXISTS "Admins manage ads" ON ads;
CREATE POLICY "Admins manage ads" ON ads FOR ALL USING (is_admin(auth.uid()));


-- 2. SITE SETTINGS (SEO & Config)
CREATE TABLE IF NOT EXISTS site_settings (
    key text PRIMARY KEY,
    value text,
    description text,
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view settings" ON site_settings;
CREATE POLICY "Public can view settings" ON site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage settings" ON site_settings;
CREATE POLICY "Admins manage settings" ON site_settings FOR ALL USING (is_admin(auth.uid()));

-- Insert defaults
INSERT INTO site_settings (key, value, description) VALUES
('site_title', 'Boxing24 - Elite Performance', 'Globalny tytuł strony'),
('maintenance_mode', 'false', 'Tryb przerwy technicznej'),
('top_banner_message', 'Treningi Personalne -20% do końca miesiąca!', 'Pasek ogłoszeń na górze')
ON CONFLICT (key) DO NOTHING;


-- 3. ANALYTICS EVENTS (Statystyki)
CREATE TABLE IF NOT EXISTS analytics_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type text NOT NULL, -- 'page_view', 'click', 'signup', 'purchase'
    page_path text,
    user_id uuid REFERENCES auth.users(id),
    metadata jsonb,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can insert events" ON analytics_events;
CREATE POLICY "Public can insert events" ON analytics_events FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins view analytics" ON analytics_events;
CREATE POLICY "Admins view analytics" ON analytics_events FOR SELECT USING (is_admin(auth.uid()));


-- 4. TRAINING ASSIGNMENTS (Dziennik Trenera)
CREATE TABLE IF NOT EXISTS training_assignments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id uuid REFERENCES auth.users(id) NOT NULL,
    client_id uuid REFERENCES auth.users(id) NOT NULL,
    plan_name text NOT NULL,
    plan_data jsonb NOT NULL, -- Snapshot of the plan
    status text DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    progress int DEFAULT 0,
    assigned_at timestamptz DEFAULT now(),
    due_date timestamptz
);

ALTER TABLE training_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Coaches view their assignments" ON training_assignments;
CREATE POLICY "Coaches view their assignments" ON training_assignments 
    FOR SELECT USING (auth.uid() = coach_id);
    
DROP POLICY IF EXISTS "Clients view their assignments" ON training_assignments;
CREATE POLICY "Clients view their assignments" ON training_assignments 
    FOR SELECT USING (auth.uid() = client_id);
    
DROP POLICY IF EXISTS "Coaches manage assignments" ON training_assignments;
CREATE POLICY "Coaches manage assignments" ON training_assignments 
    FOR ALL USING (auth.uid() = coach_id);


-- 5. PROFILE UPGRADES
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialization text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number text;
