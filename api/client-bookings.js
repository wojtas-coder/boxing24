import { getSupabase, corsHeaders, validateSession } from './_utils.js';

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

    // Validate Session & Get User
    let user;
    try {
        user = await validateSession(req);
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized' }, { headers: corsHeaders });
    }

    const email = user.email; // TRUST THE TOKEN, NOT THE QUERY param

    const supabase = getSupabase();

    try {
        // Fetch all bookings for this email
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('client_email', email) // Case sensitive? Standard emails usually LC.
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
