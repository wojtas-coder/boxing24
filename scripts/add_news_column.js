
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY; // Using anon key, might need service role if RLS is strict, but let's try.

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addColumn() {
    console.log('Attempting to add image_position column via SQL... (This may require service role or direct SQL access)');
    // Since we can't easily run ALTER TABLE via typical anon client, 
    // we'll try to just update a record with the new field. 
    // If it succeeds, the column exists. If it fails with "column does not exist", we know we need to suggest a migration or try another way.

    const { error } = await supabase.from('news').update({ image_position: 'center' }).match({ title: 'Joshua vs Dubois II – Londyn zapłonie we wrześniu!' });

    if (error) {
        console.log('Update failed, column probably missing:', error.message);
        if (error.message.includes('column "image_position" of relation "news" does not exist')) {
            console.log('Confirmed: column is missing.');
        }
    } else {
        console.log('Column exists or was successfully added (unlikely via update).');
    }
    process.exit(0);
}

addColumn();
