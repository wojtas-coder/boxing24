import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: products } = await supabase.from('products').select('id, name, slug, category, is_active, stock_count');
    console.log("ALL PRODUCTS:", products);
}
check();
