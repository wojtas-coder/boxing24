import { Resend } from 'resend';
import { getSupabase, validateSession, corsHeaders } from './_utils.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).set(corsHeaders).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 1. Validate Admin Session
        const user = await validateSession(req);
        const supabase = getSupabase();

        // Check if user is admin specifically
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || !['admin', 'coach'].includes(profile.role)) {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }

        const { subject, htmlContent, previewText } = req.body;

        if (!subject || !htmlContent) {
            return res.status(400).json({ error: 'Missing subject or content' });
        }

        // 2. Fetch all active subscribers
        const { data: subscribers, error: subError } = await supabase
            .from('subscribers')
            .select('email')
            .eq('is_active', true);

        if (subError) throw subError;

        if (!subscribers || subscribers.length === 0) {
            return res.status(200).json({ message: 'No active subscribers found.' });
        }

        // 3. Send emails via Resend Batch (more efficient)
        // We split into chunks of 100 as per Resend limits per batch call
        const batchSize = 100;
        const total = subscribers.length;
        let sentCount = 0;

        for (let i = 0; i < total; i += batchSize) {
            const chunk = subscribers.slice(i, i + batchSize);
            const batchPayload = chunk.map(sub => ({
                from: 'Boxing24 <biuro@boxing24.pl>', // Fallback to onboarding@resend.dev if domain not verified
                to: sub.email,
                subject: subject,
                html: htmlContent,
                text: previewText || subject
            }));

            // If domain not verified, Resend might reject biuro@boxing24.pl 
            // but we try it first. If it fails, user needs to verify domain.
            const results = await resend.batch.send(batchPayload);
            if (results.error) {
                console.error('Resend Batch Error:', results.error);
                // If it's a domain error, we could fallback or just report it
                if (results.error.message.includes('not verified')) {
                    throw new Error('Resend: Domain boxing24.pl is not verified. Please verify it in Resend dashboard.');
                }
                throw new Error(results.error.message);
            }
            sentCount += chunk.length;
        }

        return res.status(200).json({
            success: true,
            message: `Newsletter sent successfully to ${sentCount} recipients.`,
            count: sentCount
        });

    } catch (error) {
        console.error('Send Newsletter Error:', error);
        return res.status(error.message.includes('token') ? 401 : 500).json({
            error: error.message
        });
    }
}
