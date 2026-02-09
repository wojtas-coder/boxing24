import { getSupabase, corsHeaders } from './_utils.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({}, { headers: corsHeaders });
    }

    const supabase = getSupabase();

    try {
        if (req.method === 'GET') {
            const { coachId } = req.query; // UUID or String? Plan creator linked to UUID usually
            // We'll support both, but training_plans is new, so it uses UUID creator_id.
            // But verify if we want to filter by "legacy" coach string? No, plans are personal.

            // Get all plans for this user (coach) + public plans
            // We assume request is authenticated or we trust params for now (MVP)

            // If coachId is 'wojciech-rewczuk', we might need to find his UUID?
            // Actually, for creating plans, let's use the USER ID (UUID) from the token if possible.
            // But here we rely on query param or body.

            // Let's just fetch ALL plans for now (small scale) or filter if param provided.
            let query = supabase.from('training_plans').select('*').order('created_at', { ascending: false });

            // if (coachId) query = query.eq('creator_id', coachId); // If we pass UUID

            const { data, error } = await query;
            if (error) throw error;
            return res.status(200).json({ plans: data }, { headers: corsHeaders });
        }

        if (req.method === 'POST') {
            const { title, subtitle, description, level, duration, schedule, creator_id } = req.body;

            const newPlan = {
                title, subtitle, description, level, duration, schedule,
                creator_id, // UUID
                is_public: false
            };

            const { data, error } = await supabase.from('training_plans').insert(newPlan).select().single();
            if (error) throw error;
            return res.status(200).json(data, { headers: corsHeaders });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            const { error } = await supabase.from('training_plans').delete().eq('id', id);
            if (error) throw error;
            return res.status(200).json({ success: true }, { headers: corsHeaders });
        }

    } catch (err) {
        console.error("Training Plans API Error:", err);
        return res.status(500).json({ error: err.message }, { headers: corsHeaders });
    }
}
