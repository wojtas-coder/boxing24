
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from './_utils.js';

const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({}, { headers: corsHeaders });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' }, { headers: corsHeaders });
    }

    const { coachId } = req.query;

    if (!coachId) {
        return res.status(400).json({ error: 'Missing coachId' }, { headers: corsHeaders });
    }

    try {
        // Dynamic Init with Auth Header
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
        const options = {};

        if (req.headers.authorization) {
            options.global = {
                headers: { Authorization: req.headers.authorization }
            };
        }

        const supabase = createClient(supabaseUrl, supabaseKey, options);

        // 1. Get unique clients from bookings
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('client_email, client_name, end_time')
            .eq('coach_id', coachId)
            .neq('client_name', 'BLOKADA') // Exclude blocked slots
            .order('end_time', { ascending: false });

        if (bookingsError) throw bookingsError;

        const clientsMap = new Map();

        bookings.forEach(b => {
            const email = b.client_email?.toLowerCase();
            if (!email) return;

            if (!clientsMap.has(email)) {
                clientsMap.set(email, {
                    email: email,
                    name: b.client_name,
                    lastTraining: b.end_time,
                    totalSessions: 1,
                    profile: null // Will fill this next
                });
            } else {
                const client = clientsMap.get(email);
                client.totalSessions += 1;
                if (new Date(b.end_time) > new Date(client.lastTraining)) {
                    client.lastTraining = b.end_time;
                }
            }
        });

        const clients = Array.from(clientsMap.values());

        // 2. Fetch profiles using Auth Admin to resolve Emails -> IDs
        // WRAPPED IN TRY-CATCH TO PREVENT CRASHING THE WHOLE LIST
        try {
            if (clients.length > 0) {
                const emails = clients.map(c => c.email);

                // A. Resolve IDs from Auth Users (Admin)
                let users = [];
                let authErrorStr = null;

                if (supabase.auth && supabase.auth.admin) {
                    const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
                        page: 1,
                        perPage: 1000
                    });
                    users = authData?.users || [];
                    if (authError) authErrorStr = authError.message;
                } else {
                    authErrorStr = "supabase.auth.admin missing";
                }

                if (authErrorStr) console.error("Auth Admin Warning:", authErrorStr);

                // B. Fetch Profiles by ID
                const validUserIds = [];
                if (users && users.length > 0) {
                    users.forEach(u => {
                        if (u.email && emails.includes(u.email)) {
                            validUserIds.push(u.id);
                        }
                    });
                }

                if (validUserIds.length > 0) {
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('*')
                        .in('id', validUserIds);

                    if (profiles) {
                        profiles.forEach(p => {
                            const userEmail = users.find(u => u.id === p.id)?.email;
                            const client = clients.find(c => c.email === userEmail);
                            if (client) {
                                client.profile = p;
                                if (p.full_name) client.name = p.full_name;
                            }
                        });
                    }
                }
            }
        } catch (enrichmentError) {
            console.error("Profile Enrichment Failed:", enrichmentError);
            // Ignore error and return basic client list
        }

        return res.status(200).json({
            fighters: clients,
            debug: {
                enrichmentAttempted: true,
                serviceRoleKeyConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('Coach Fighters API Error:', error);
        return res.status(500).json({ error: error.message }, { headers: corsHeaders });
    }
}
