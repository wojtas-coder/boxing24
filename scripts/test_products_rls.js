import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('slug', 'the-viking-pro-gloves');

    console.log("Service Role Update:", error || "Success");

    // Test with anon key
    const supabaseAnon = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
    const { data: d2, error: e2 } = await supabaseAnon
        .from('products')
        .update({ is_active: false })
        .eq('slug', 'the-viking-pro-gloves');

    console.log("Anon Update:", e2 || "Success");

    const { data: rlsCheck } = await supabase.rpc('hello_world'); // dummy to check 
}

check();
