import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS and see everything
);

async function inspectPolicies() {
    console.log('Sprawdzanie tabeli i polityk...');

    // Check if table exists
    const { data: tables, error: tError } = await supabase
        .from('subscribers')
        .select('*')
        .limit(1);

    if (tError) {
        console.error('Błąd dostępu do tabeli (może nie istnieć?):', tError);
    } else {
        console.log('Tabela istnieje.');
    }

    // Try an insert with service role to see if it works
    const testEmail = `test-service-role-${Date.now()}@example.com`;
    const { error: iError } = await supabase
        .from('subscribers')
        .insert([{ email: testEmail }]);

    if (iError) {
        console.error('Insert z Service Role NIEUDANY:', iError);
    } else {
        console.log('Insert z Service Role UDANY.');
    }
}

inspectPolicies();
