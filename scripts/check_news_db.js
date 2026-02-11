
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkNews() {
    const { data, error } = await supabase.from('news').select('title, created_at').order('created_at', { ascending: false }).limit(5);
    if (error) {
        console.error('Error:', error);
        process.exit(1);
    }
    console.log('Latest news in DB:');
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
}

checkNews();
