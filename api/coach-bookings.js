
import { getSupabase, corsHeaders } from './_utils.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({}, { headers: corsHeaders });
    }

    const { coachId } = req.query;

    if (!coachId) {
        return res.status(400).json({ error: 'Missing coachId' }, { headers: corsHeaders });
    }

    try {
        const supabase = getSupabase();

        // Fetch bookings for the coach
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('coach_id', coachId)
            .neq('status', 'cancelled')
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true });

        if (error) {
            console.error('Supabase Error:', error);
            return res.status(500).json({ error: error.message }, { headers: corsHeaders });
        }

        return res.status(200).json({ bookings: bookings || [] }, { headers: corsHeaders });

    } catch (err) {
        console.error('Server Error:', err);
        return res.status(500).json({ error: 'Internal Server Error' }, { headers: corsHeaders });
    }
}
