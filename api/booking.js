
import { getSupabase, corsHeaders } from './_utils.js';
import { addMinutes, parseISO, format } from 'date-fns';
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

    const { coachId, date, time, clientName, clientEmail, clientPhone, notes } = req.body;

    if (!coachId || !date || !time || !clientEmail) {
        return res.status(400).json({ error: 'Missing required fields' }, { headers: corsHeaders });
    }

    try {
        const supabase = getSupabase();

        // 1. Calculate Timestamps
        const startDateTime = new Date(`${date}T${time}:00`);
        const { data: settings } = await supabase.from('coach_settings').select('session_duration_minutes, google_calendar_id, coach_id').eq('coach_id', coachId).single();
        const duration = settings?.session_duration_minutes || 60;
        const endDateTime = addMinutes(startDateTime, duration);

        // 2. Insert into Supabase
        const { data: booking, error: dbError } = await supabase
            .from('bookings')
            .insert({
                coach_id: coachId,
                client_name: clientName,
                client_email: clientEmail,
                client_phone: clientPhone,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                status: 'pending',
                notes: notes
            })
            .select()
            .single();

        if (dbError) throw dbError;

        // 3. Sync to Google Calendar
        let gcalLink = null;
        if (settings?.google_calendar_id && process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
            try {
                const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
                const auth = new google.auth.JWT(
                    credentials.client_email, null, credentials.private_key,
                    ['https://www.googleapis.com/auth/calendar.events']
                );
                const calendar = google.calendar({ version: 'v3', auth });

                const event = await calendar.events.insert({
                    calendarId: settings.google_calendar_id,
                    requestBody: {
                        summary: `Trening: ${clientName}`,
                        description: `Klient: ${clientName}\nTel: ${clientPhone}\nEmail: ${clientEmail}\nNotatki: ${notes || '-'}`,
                        start: { dateTime: startDateTime.toISOString() },
                        end: { dateTime: endDateTime.toISOString() },
                    }
                });

                if (event.data.id) {
                    await supabase.from('bookings').update({ gcal_event_id: event.data.id, status: 'confirmed' }).eq('id', booking.id);
                    gcalLink = event.data.htmlLink;
                }
            } catch (gError) {
                console.error('GCal Sync Error:', gError);
            }
        }

        // 4. Send Email (via Resend)
        if (process.env.RESEND_API_KEY) {
            try {
                await resend.emails.send({
                    from: 'Boxing24 <onboarding@resend.dev>',
                    to: [clientEmail],
                    subject: 'Potwierdzenie Rezerwacji - Boxing24',
                    html: `
                        <h1>Cześć ${clientName}!</h1>
                        <p>Twoja rezerwacja została przyjęta.</p>
                        <p><strong>Data:</strong> ${date}</p>
                        <p><strong>Godzina:</strong> ${time}</p>
                        <p><strong>Trener:</strong> ${coachId}</p>
                        <p>Do zobaczenia na treningu!</p>
                    `
                });
            } catch (emailError) {
                console.error('Email Error:', emailError);
            }
        }

        return res.status(200).json({ success: true, bookingId: booking.id, gcal: gcalLink }, { headers: corsHeaders });

    } catch (error) {
        console.error('Booking API Error:', error);
        return res.status(500).json({ error: error.message }, { headers: corsHeaders });
    }
}
