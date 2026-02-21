import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.rpc('exec_sql', { sql: "SELECT policyname, perms, cmd, qual, with_check FROM pg_policies WHERE tablename = 'products';" });
    console.log("Error:", error);
    console.log("Policies:", JSON.stringify(data, null, 2));
}
check();
