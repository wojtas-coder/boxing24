import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from './_utils.js';

// Use Service Role Key for reliable message delivery/fetching
const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({}, { headers: corsHeaders });
    }

    const supabase = supabaseAdmin;

    if (req.method === 'GET') {
        // GET /api/messages?user1=UID&user2=UID
        // Fetch conversation between two users
        const { user1, user2 } = req.query;

        if (!user1 || !user2) {
            return res.status(400).json({ error: 'Missing user IDs' }, { headers: corsHeaders });
        }

        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${user1},receiver_id.eq.${user1}`)
                .or(`sender_id.eq.${user2},receiver_id.eq.${user2}`)
                .order('created_at', { ascending: true });

            if (error) throw error;

            return res.status(200).json(data, { headers: corsHeaders });
        } catch (error) {
            return res.status(500).json({ error: error.message }, { headers: corsHeaders });
        }
    }

    if (req.method === 'POST') {
        // POST /api/messages
        // Body: { sender_id, receiver_id, content }
        const { sender_id, receiver_id, content } = req.body;

        if (!sender_id || !receiver_id || !content) {
            return res.status(400).json({ error: 'Missing fields' }, { headers: corsHeaders });
        }

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert([{ sender_id, receiver_id, content, read: false }])
                .select();

            if (error) throw error;

            return res.status(200).json(data[0], { headers: corsHeaders });
        } catch (error) {
            return res.status(500).json({ error: error.message }, { headers: corsHeaders });
        }
    }

    // PATCH: Mark as read
    if (req.method === 'PATCH') {
        const { messageIds } = req.body;
        if (!messageIds || !Array.isArray(messageIds)) {
            return res.status(400).json({ error: 'Missing messageIds array' }, { headers: corsHeaders });
        }

        try {
            const { error } = await supabase
                .from('messages')
                .update({ read: true })
                .in('id', messageIds);

            if (error) throw error;

            return res.status(200).json({ success: true }, { headers: corsHeaders });

        } catch (error) {
            return res.status(500).json({ error: error.message }, { headers: corsHeaders });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' }, { headers: corsHeaders });
}
