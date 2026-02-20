import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSubscribers() {
    console.log('Sprawdzanie subskrybentów...');
    const { data, error } = await supabase
        .from('subscribers')
        .select('*');

    if (error) {
        console.error('Błąd:', error);
    } else {
        console.log('Subskrybenci w bazie:', data);
        console.log('Liczba:', data.length);
    }
}

checkSubscribers();
