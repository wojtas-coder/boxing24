import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkInsert() {
    console.log('Testowanie wstawienia duplikatu...');
    // We try to insert a test email that we will run twice
    const testEmail = 'test-duplicate@boxing24.pl';

    // First insert
    const { error: e1 } = await supabase.from('subscribers').insert([{ email: testEmail }]);
    if (e1) console.log('Insert 1 error:', e1.message);
    else console.log('Insert 1 success');

    // Second insert
    const { error: e2 } = await supabase.from('subscribers').insert([{ email: testEmail }]);
    if (e2) console.log('Insert 2 error (hopefully duplicate):', e2.code, e2.message);
    else console.log('Insert 2 success (!?)');
}

checkInsert();
