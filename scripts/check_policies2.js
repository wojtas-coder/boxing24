import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: policies, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);

    // We can't query pg_policies via standard rest api unless we have an RPC, so let's just create an RPC
    const createRpc = `
    CREATE OR REPLACE FUNCTION get_table_policies(tbl_name text)
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
        result json;
    BEGIN
        SELECT json_agg(row_to_json(p))
        INTO result
        FROM pg_policies p
        WHERE tablename = tbl_name;
        RETURN result;
    END;
    $$;
    `;

    // Create the RPC via REST by doing nothing or if possible... actually we can't create an RPC from JS client unless we execute a raw SQL.
    // Let's use service key to create an entry, and try to query it.
}
check();
