-- Force Fix Storage Permissions
-- This script will DROP existing policies to avoid conflicts and re-create them.

BEGIN;

-- 1. Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-images', 'news-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop potential existing policies to start fresh
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
-- Handle cases where policy names might be different (optional but safe)
DROP POLICY IF EXISTS "Give me access" ON storage.objects;

-- 3. Re-create Policies

-- A. PUBLIC READ ACCESS (Crucial for showing images on the site)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'news-images' );

-- B. AUTHENTICATED UPLOAD (Allows logged-in users to upload)
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'news-images' AND auth.role() = 'authenticated' );

-- C. AUTHENTICATED UPDATE
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'news-images' AND auth.role() = 'authenticated' );

-- D. AUTHENTICATED DELETE
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'news-images' AND auth.role() = 'authenticated' );

COMMIT;
