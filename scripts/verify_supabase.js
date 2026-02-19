import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNews() {
    console.log('Checking "news" table...');
    const { data, count, error } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error fetching from "news" table:', error);
    } else {
        console.log('Success! Found', count, 'rows in "news" table.');
    }

    console.log('Checking "article_views" table...');
    const { data: viewsData, count: viewsCount, error: viewsError } = await supabase
        .from('article_views')
        .select('*', { count: 'exact', head: true });

    if (viewsError) {
        console.error('Error fetching from "article_views" table:', viewsError);
    } else {
        console.log('Success! Found', viewsCount, 'rows in "article_views" table.');
    }
}

checkNews();
