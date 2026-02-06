
import { getSupabase, corsHeaders } from './_utils.js';

export default async function handler(req, res) {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).json({}, { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' }, { headers: corsHeaders });
    }

    try {
        const { coachId, workStart, workEnd, googleCalendarId } = req.body;

        if (!coachId) {
            return res.status(400).json({ error: 'Missing coachId' }, { headers: corsHeaders });
        }

        const supabase = getSupabase();

        // Check if row exists first (optional, but upsert handles it)
        // We use upsert to create or update
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
            // Return specific error codes to help debugging
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
