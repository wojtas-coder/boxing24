import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function upgrade() {
    console.log("Upgrading products table schema...");
    const sql = `
        -- Alter table to add new professional e-commerce fields
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS old_price TEXT;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Uncategorized';
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 10;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_preorder BOOLEAN DEFAULT false;

        -- Drop temporary RLS policies if they exist to restore strict security
        DROP POLICY IF EXISTS "Temp Upload" ON storage.objects;
        DROP POLICY IF EXISTS "Temp Upload Update" ON storage.objects;
        DROP POLICY IF EXISTS "Temp Insert" ON public.products;
        DROP POLICY IF EXISTS "Temp Update" ON public.products;
    `;

    const { error } = await supabase.rpc('exec_sql', { sql: sql });
    if (error) {
        // exec_sql might not exist, we'll run via REST or we need to ask the user to run it if we can't execute RAW SQL.
        console.error("RPC exec_sql failed, attempting individual API calls if possible, else error:", error.message);
    } else {
        console.log("Table structure upgraded successfully!");
    }
}

upgrade();
