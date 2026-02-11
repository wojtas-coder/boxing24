-- DEBUG: ALLOW ALL ACCESS to news-images
-- WARNING: This allows ANYONE to upload/delete files. Use only for debugging.

BEGIN;

-- 1. Ensure bucket is public
UPDATE storage.buckets SET public = true WHERE id = 'news-images';

-- 2. Drop existing restrictive policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- 3. Create a single "ALLOW ALL" policy for this bucket
CREATE POLICY "DEBUG_ALLOW_ALL"
ON storage.objects
FOR ALL
USING ( bucket_id = 'news-images' )
WITH CHECK ( bucket_id = 'news-images' );

COMMIT;
