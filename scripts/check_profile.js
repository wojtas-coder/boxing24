import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkProfile() {
    console.log('Sprawdzanie profilu admina...');
    const email = 'kontakt@wojciechrewczuk.pl';

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

    console.log('Profile:', profile);
    console.log('Error:', error);
}

checkProfile();
