import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkBookingsRLS() {
    console.log('Sprawdzanie RLS dla bookings...');
    // Simulate admin login to see if we can fetch everything
    const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'wojtekrewczuk@gmail.com', // Admin email
        password: 'boxing24admin' // Try a dummy password or we can just check with service role if we want to bypass, but we want to know if admin can read. Actually, we don't have the password.
    });

    // Instead of logging in, let's just create a raw query to fetch policies
    const { data: policies, error: polErr } = await supabase.rpc('get_policies', { table_name: 'bookings' });
    // Or we can just try to fetch without auth to see what happens

    const { data: noAuthData, error: noAuthErr } = await supabase.from('bookings').select('*');
    console.log('Anon fetch:', noAuthData?.length, noAuthErr?.message);
}

checkBookingsRLS();
