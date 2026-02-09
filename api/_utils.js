
import { createClient } from '@supabase/supabase-js';

// Helper to init Supabase in Server context (using Service Role for admin tasks if needed, or Anon)
// Note: For backend actions like emails/calendar, we should use SERVICE_ROLE_KEY if possible to bypass RLS,
// but for this MVP we might use the Anon key if RLS allows.
// Ideally usage: process.env.SUPABASE_SERVICE_ROLE_KEY
export const getSupabase = () => {
    return createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    );
};

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
