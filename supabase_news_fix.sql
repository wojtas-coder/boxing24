-- Enable RLS to be safe
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they conflict (optional but safer)
DROP POLICY IF EXISTS "Public Read" ON news;
DROP POLICY IF EXISTS "Admin Full Access" ON news;

-- Allow public read access (so everyone can see news)
CREATE POLICY "Public Read" 
ON news FOR SELECT 
USING (true);

-- Allow authenticated users (Admin)  to do EVERYTHING (Insert, Update, Delete)
CREATE POLICY "Admin Full Access" 
ON news FOR ALL 
USING (auth.role() = 'authenticated');

-- Verify table exists (just a select, will error if missing)
SELECT count(*) FROM news;
