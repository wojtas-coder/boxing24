import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

const supabaseAnon = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    // 1. Check current status
    const { data: before } = await supabaseAnon.from('products').select('is_active').eq('slug', 'the-viking-pro-gloves').single();
    console.log("Before:", before);

    // 2. Try to update using Anon key
    const { data, error } = await supabaseAnon
        .from('products')
        .update({ is_active: !before?.is_active })
        .eq('slug', 'the-viking-pro-gloves')
        .select();

    console.log("Update Error:", error);
    console.log("Returned Data after update:", data);

    // 3. Check status again
    const { data: after } = await supabaseAnon.from('products').select('is_active').eq('slug', 'the-viking-pro-gloves').single();
    console.log("After:", after);
}
check();
