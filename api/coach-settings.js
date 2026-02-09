
import { getSupabase, corsHeaders } from './_utils.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({}, { headers: corsHeaders });
    }

    if (req.method === 'POST') {
        try {
            const { coachId, workStart, workEnd, googleCalendarId } = req.body;

            if (!coachId) {
                return res.status(400).json({ error: 'Missing coachId' }, { headers: corsHeaders });
            }

            const supabase = getSupabase();

            const { data, error } = await supabase
                .from('coach_settings')
                .upsert({
                    coach_id: coachId,
                    work_start_time: workStart,
                    work_end_time: workEnd,
                    google_calendar_id: googleCalendarId
                }, { onConflict: 'coach_id' })
                .select()
                .single();

            if (error) {
                console.error('Supabase Error:', error);
                return res.status(500).json({
                    error: error.message,
                    code: error.code,
                    details: error.details
                }, { headers: corsHeaders });
            }

            return res.status(200).json({ success: true, data }, { headers: corsHeaders });

        } catch (err) {
            console.error('Server Error:', err);
            return res.status(500).json({ error: 'Internal Server Error: ' + err.message }, { headers: corsHeaders });
        }
    }

    // Default to GET
    const { coachId } = req.query;
    if (!coachId) {
        return res.status(400).json({ error: 'Missing coachId' }, { headers: corsHeaders });
    }

    try {
        const supabase = getSupabase();

        // Fetch settings
        const { data, error } = await supabase
            .from('coach_settings')
            .select('*')
            .eq('coach_id', coachId)
            .single();

        // If no settings found (PGRST116), return defaults or empty
        if (error && error.code !== 'PGRST116') {
            console.error('Supabase Error:', error);
            return res.status(500).json({ error: error.message }, { headers: corsHeaders });
        }

        return res.status(200).json({ settings: data || null }, { headers: corsHeaders });

    } catch (err) {
        console.error('Server Error:', err);
        return res.status(500).json({ error: 'Internal Server Error' }, { headers: corsHeaders });
    }
}
