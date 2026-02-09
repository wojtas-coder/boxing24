
import { getSupabase, corsHeaders } from './_utils.js';
import { google } from 'googleapis';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({}, { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' }, { headers: corsHeaders });
    }

    const { bookingId, reason, coachId } = req.body;

    if (!bookingId || !coachId) {
        return res.status(400).json({ error: 'Missing bookingId or coachId' }, { headers: corsHeaders });
    }

    try {
        const supabase = getSupabase();

        // 1. Get booking details
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (fetchError || !booking) {
            return res.status(404).json({ error: 'Booking not found' }, { headers: corsHeaders });
        }

        // 2. Update status in DB
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId);

        if (updateError) throw updateError;

        // 3. Remove from Google Calendar
        const { data: settings } = await supabase.from('coach_settings').select('google_calendar_id').eq('coach_id', coachId).single();

        if (booking.gcal_event_id && settings?.google_calendar_id && process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
            try {
                const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
                const auth = new google.auth.JWT(
                    credentials.client_email, null, credentials.private_key,
                    ['https://www.googleapis.com/auth/calendar.events']
                );
                const calendar = google.calendar({ version: 'v3', auth });
                await calendar.events.delete({
                    calendarId: settings.google_calendar_id,
                    eventId: booking.gcal_event_id
                });
            } catch (gError) {
                console.error('GCal Delete Error:', gError);
            }
        }

        // 4. Send Email Notification
        if (process.env.RESEND_API_KEY) {
            try {
                await resend.emails.send({
                    from: 'Boxing24 <powiadomienia@boxing24.pl>',
                    to: [booking.client_email],
                    subject: 'Anulowanie Treningu - Boxing24',
                    html: `
                        <h1>Twój trening został odwołany</h1>
                        <p>Trening zaplanowany na: <strong>${new Date(booking.start_time).toLocaleString('pl-PL')}</strong> został anulowany.</p>
                        <p><strong>Powód:</strong> ${reason || 'Przyczyny losowe'}</p>
                        <p>Przepraszamy za niedogodności. Skontaktuj się z nami, aby ustalić nowy termin.</p>
                    `
                });
            } catch (emailError) {
                console.error('Email Error:', emailError);
            }
        }

        return res.status(200).json({ success: true }, { headers: corsHeaders });

    } catch (error) {
        console.error('Cancel API Error:', error);
        return res.status(500).json({ error: error.message }, { headers: corsHeaders });
    }
}
