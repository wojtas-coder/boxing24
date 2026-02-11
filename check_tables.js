
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function listTables() {
    // Try to select from 'articles' to see if it exists
    const { data, error } = await supabase.from('articles').select('*', { count: 'exact', head: true });
    if (error) {
        console.log("Articles table error:", error.message);
        // Try news
        const { count: newsCount } = await supabase.from('news').select('*', { count: 'exact', head: true });
        console.log("News table count:", newsCount);
    } else {
        console.log("Articles table exists.");
    }
}

listTables();
