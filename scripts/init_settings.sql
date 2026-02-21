-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if we are starting fresh (required for this schema change)
DROP TABLE IF EXISTS public.site_settings CASCADE;

CREATE TABLE IF NOT EXISTS public.site_settings (
    id integer PRIMARY KEY DEFAULT 1,
    -- Ensure only one row exists:
    CONSTRAINT single_row CHECK (id = 1),
    
    -- 1. General & Company
    company_name text DEFAULT 'Boxing24 Sp. z o.o.',
    company_nip text DEFAULT '8970000000',
    contact_email text DEFAULT 'kontakt@boxing24.pl',
    contact_phone text DEFAULT '+48 500 000 000',
    address_street text DEFAULT 'ul. Przykładowa 1',
    address_postal text DEFAULT '50-000',
    address_city text DEFAULT 'Wrocław',
    business_hours text DEFAULT 'Pon-Pt 06:00 - 22:00',
    
    -- 2. SEO & Meta
    seo_title_suffix text DEFAULT ' | Boxing24 - Elite Performance',
    seo_default_description text DEFAULT 'Profesjonalne centrum testów i przygotowania motorycznego',
    seo_default_og_image text DEFAULT '',
    
    -- 3. Social Media
    social_instagram text DEFAULT 'https://instagram.com/boxing24',
    social_facebook text DEFAULT 'https://facebook.com/boxing24',
    social_youtube text DEFAULT 'https://youtube.com/@Boxing24_pl',
    social_tiktok text DEFAULT '',
    social_x text DEFAULT '',
    
    -- 4. Branding (Visuals)
    brand_logo_url text DEFAULT '',
    brand_favicon_url text DEFAULT '',
    color_primary text DEFAULT '#dc2626',
    color_secondary text DEFAULT '#22c55e',
    
    -- 5. Integrations
    analytics_ga4_id text DEFAULT '',
    meta_pixel_id text DEFAULT '',
    
    -- 6. System Toggles
    is_maintenance_mode boolean DEFAULT false,
    is_registration_open boolean DEFAULT true,
    is_booking_active boolean DEFAULT true,
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert the default single row if the table is empty
INSERT INTO public.site_settings (id) 
SELECT 1 
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- 1. Everyone can read the settings (needed for site rendering)
DROP POLICY IF EXISTS "Settings are publicly viewable" ON public.site_settings;
CREATE POLICY "Settings are publicly viewable"
ON public.site_settings FOR SELECT
TO public
USING (true);

-- 2. Only authenticated admins can update settings
DROP POLICY IF EXISTS "Admins can update settings" ON public.site_settings;
CREATE POLICY "Admins can update settings"
ON public.site_settings FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create a generic trigger to auto-update 'updated_at' if it doesn't exist
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_site_settings_modtime ON public.site_settings;
CREATE TRIGGER update_site_settings_modtime
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Grant permissions explicitly
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.site_settings TO authenticated;
GRANT UPDATE ON public.site_settings TO authenticated;
