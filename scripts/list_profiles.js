import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkProfiles() {
    console.log('Fetching all profiles...');
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

    console.log(`Znaleziono ${profiles?.length || 0} profili.`);
    if (profiles) {
        profiles.forEach(p => console.log(`${p.email} - Role: ${p.role}`));
    }
}

checkProfiles();
