import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSchema() {
    console.log('Fetching bookings table structure...');
    // A quick way is to just fetch one row
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .limit(1);

    console.log('Sample Data or Columns:', data);
    if (error) console.log('Error:', error);
}

checkSchema();
