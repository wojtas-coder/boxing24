
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase credentials. Authentication will not work until .env is configured.');
}

// Main client - used for all operations including auth and data
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'b24-auth-token', // Custom key for more reliable clearing
        storage: window.localStorage
    }
});

// Alias for legacy support - now shares the same auth session!
export const supabaseData = supabase;

// Raw fetch helper - ultimate fallback if Supabase client fails
export async function supabaseRawQuery(table, { select = '*', limit, orderBy, ascending = false, filters = {} } = {}) {
    const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
    url.searchParams.set('select', select);
    if (limit) url.searchParams.set('limit', String(limit));
    if (orderBy) url.searchParams.set('order', `${orderBy}.${ascending ? 'asc' : 'desc'}`);

    Object.entries(filters).forEach(([key, value]) => {
        url.searchParams.set(key, `eq.${value}`);
    });

    const resp = await fetch(url.toString(), {
        headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'count=exact'
        }
    });

    if (!resp.ok) {
        throw new Error(`Supabase API error: ${resp.status} ${resp.statusText}`);
    }

    const data = await resp.json();
    const contentRange = resp.headers.get('content-range');
    const count = contentRange ? parseInt(contentRange.split('/')[1]) : data.length;

    return { data, count };
}
