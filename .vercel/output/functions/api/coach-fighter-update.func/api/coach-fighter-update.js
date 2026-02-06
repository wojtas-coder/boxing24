
import { getSupabase, corsHeaders } from './_utils.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({}, { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' }, { headers: corsHeaders });
    }

    const { fighterEmail, fighterId, results } = req.body;

    if ((!fighterEmail && !fighterId) || !results) {
        return res.status(400).json({ error: 'Missing required fields' }, { headers: corsHeaders });
    }

    try {
        const supabase = getSupabase();

        // 1. Resolve ID if missing
        let targetId = fighterId;

        if (!targetId && fighterEmail) {
            // Try to find user ID by email via Admin API
            // Try to find user ID by email via Admin API
            const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
                page: 1,
                perPage: 1000
            });

            const users = authData?.users || [];

            if (users) {
                const user = users.find(u => u.email === fighterEmail);
                if (user) targetId = user.id;
            }
        }

        // 2. Check if profile exists (BY ID ONLY)
        if (!targetId) {
            const debugInfo = `Email: ${fighterEmail}, UsersFound: ${users?.length || 0}, AuthError: ${authError?.message || 'none'}`;
            return res.status(404).json({ error: `Nie znaleziono użytkownika. ${debugInfo}` }, { headers: corsHeaders });
        }

        let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', targetId)
            .single();

        if (profileError && profileError.code !== 'PGRST116') throw profileError;

        // 2. If no profile, we can't save permanent stats yet (or we could create a shadow profile, but for now let's strict)
        // Actually, let's return an error if user not registered, OR just update if exists.
        if (!profile) {
            return res.status(404).json({ error: 'Zawodnik nie posiada jeszcze konta w aplikacji. Poproś go o rejestrację.' }, { headers: corsHeaders });
        }

        // 3. Update Profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                boxing_index_results: results,
                updated_at: new Date().toISOString()
            })
            .eq('id', profile.id);

        if (updateError) throw updateError;

        return res.status(200).json({ success: true }, { headers: corsHeaders });

    } catch (error) {
        console.error('Coach Fighter Update API Error:', error);
        return res.status(500).json({ error: error.message }, { headers: corsHeaders });
    }
}
