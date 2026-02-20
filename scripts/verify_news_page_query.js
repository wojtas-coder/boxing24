
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPageQuery() {
    const page = 1;
    const NEWS_PER_PAGE = 16;
    const from = (page - 1) * NEWS_PER_PAGE;
    const to = from + NEWS_PER_PAGE - 1;

    console.log(`Querying range: ${from} - ${to}`);

    const { data, count, error } = await supabase
        .from('news')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('QUERY FAILED:', error);
    } else {
        console.log(`SUCCESS! Found ${count} items.`);
        console.log('Sample item:', data && data[0] ? data[0].title : 'No items found');
    }
}

verifyPageQuery();
