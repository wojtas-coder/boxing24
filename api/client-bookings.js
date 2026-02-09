import { getSupabase, corsHeaders } from './_utils.js';

// Simple mapping for MVP since we don't have a coaches table yet
const COACH_MAP = {
    'e1679220-0798-471b-912e-b1e861e3c30c': 'Wojciech Rewczuk',
    'adam-bylina-uuid-placeholder': 'Adam Bylina',
    'wojciech-rewczuk': 'Wojciech Rewczuk', // Fallback for old records
    'adam-bylina': 'Adam Bylina'
};

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({}, { headers: corsHeaders });
    }

    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ error: 'Missing email' }, { headers: corsHeaders });
    }

    const supabase = getSupabase();

    try {
        // Fetch all bookings for this email
        // We use ILIKE? No, we lowercased it in booking.js, so simple eq should work if client input is consistent.
        // But better to be safe? The booking.js does data.client_email?.toLowerCase().
        // So we should query with lower case too.

        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('client_email', email.toLowerCase())
            .neq('client_name', 'BLOKADA') // Filter out admin blocks
            .order('start_time', { ascending: true });

        if (error) throw error;

        const now = new Date();
        const upcoming = [];
        const history = [];

        bookings.forEach(b => {
            const start = new Date(b.start_time);

            // Map Coach ID to Name
            const coachName = COACH_MAP[b.coach_id] || b.coach_id;

            const bookingObj = {
                id: b.id,
                coach_id: b.coach_id,
                coach_name: coachName,
                start_time: b.start_time,
                end_time: b.end_time,
                status: b.status,
                client_name: b.client_name
            };

            if (start >= now) {
                upcoming.push(bookingObj);
            } else {
                history.push(bookingObj);
            }
        });

        // Sort history descending (newest first)
        history.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

        return res.status(200).json({ upcoming, history }, { headers: corsHeaders });

    } catch (err) {
        console.error("Client Bookings API Error:", err);
        return res.status(500).json({ error: err.message }, { headers: corsHeaders });
    }
}
