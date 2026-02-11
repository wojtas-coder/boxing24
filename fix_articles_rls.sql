
-- Allow public insert/upsert for initial data sync
-- CAUTION: In production, you should restrict this to service_role or authenticated admins.
DROP POLICY IF EXISTS "Allow anon all access" ON articles;
CREATE POLICY "Allow anon all access" ON articles FOR ALL USING (true) WITH CHECK (true);
