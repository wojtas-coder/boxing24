import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log("Checking products table schema...");

    const { data: products } = await supabase.from('products').select('*').limit(1);

    if (products && products.length > 0) {
        const p = products[0];
        console.log("Trying to update product:", p.name, "ID:", p.id);

        const payload = {
            category: 'Sprzęt',
            sizes: ['M', 'L'],
            old_price: '599 PLN',
            stock_count: 5,
            is_preorder: true
        };

        const { data: updateData, error: updateError } = await supabase
            .from('products')
            .update(payload)
            .eq('id', p.id)
            .select();

        console.log("Update Error:", updateError);
        console.log("Update Result:", updateData);
    } else {
        console.log("No products found to test update.");
    }
}
check();
