
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function listAllTables() {
    // This is a common way to poke around if we don't have direct SQL access
    // We can try to query common tables or use some RPCs if available.
    // However, usually we can just check if common names respond.

    const tables = ['articles', 'news', 'profiles', 'bookings', 'coach_settings', 'availability_rules'];

    for (const table of tables) {
        const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`Table [${table}]: ERROR - ${error.message}`);
        } else {
            console.log(`Table [${table}]: EXISTS - Count: ${count}`);
        }
    }
}

listAllTables();
