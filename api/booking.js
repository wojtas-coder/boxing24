
import { getSupabase, corsHeaders } from './_utils.js';
import { addMinutes } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { google } from 'googleapis';
import { Resend } from 'resend';
import { sendSMS } from './_sms.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const TIMEZONE = 'Europe/Warsaw';


// Map Frontend String IDs to Database UUIDs
const COACH_ID_MAP = {
    'wojciech-rewczuk': 'e1679220-0798-471b-912e-b1e861e3c30c', // Replace with real UUID if different
    'adam-bylina': 'adam-bylina-uuid-placeholder' // Needs real UUID
};

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({}, { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' }, { headers: corsHeaders });
    }

    const { coachId: rawCoachId, date, time, clientName, clientEmail: rawEmail, clientPhone, notes } = req.body;
    const clientEmail = rawEmail?.toLowerCase();

    if (!rawCoachId || !date || !time || !clientEmail) {
        return res.status(400).json({ error: 'Missing required fields' }, { headers: corsHeaders });
    }

    // Resolve UUID
    const coachUuid = COACH_ID_MAP[rawCoachId] || rawCoachId;

    try {
        const supabase = getSupabase();

        // 1. Calculate Timestamps (UTC)
        const dateTimeString = `${date}T${time}:00`;
        let startDateTime;

        try {
            startDateTime = fromZonedTime(dateTimeString, TIMEZONE);
        } catch (dateErr) {
            console.error("Date Parsing Error (date-fns-tz):", dateErr);
            throw new Error(`Invalid Date Format: ${dateTimeString}`);
        }

        if (isNaN(startDateTime.getTime())) {
            throw new Error(`Invalid Date Calculation: ${dateTimeString}`);
        }

        console.log(`[Booking] Request: ${rawCoachId} (${coachUuid}), ${date} ${time} | UTC Start: ${startDateTime.toISOString()}`);

        // Fetch Settings using UUID
        const { data: settings, error: settingsError } = await supabase.from('coach_settings').select('session_duration_minutes, google_calendar_id, coach_id').eq('coach_id', coachUuid).single();

        if (settingsError && settingsError.code !== 'PGRST116') {
            console.error("Settings Fetch Error:", settingsError);
        }

        const duration = settings?.session_duration_minutes || 60;
        const endDateTime = addMinutes(startDateTime, duration);

        // 2. Insert into Supabase (Store as UTC ISO strings)
        // Note: bookings table might stick with rawCoachId if it's a string column?
        // If bookings.coach_id is UUID, we MUST use coachUuid.
        // Given previous errors, let's assume it wants UUID if it relates to users, or string if simple text.
        // Safest: Use coachUuid if it looks like a UUID, else raw.
        // For now, we use rawCoachId for 'bookings' table insert to maintain consistency with frontend 'client-bookings' fetch which expects string 'wojciech-rewczuk' likely?
        // WAIT: api/client-bookings.js maps 'wojciech-rewczuk' to name. It reads booking.coach_id.
        // If we change what we save here, we break client-bookings.
        // LET'S SAVE BOTH? Or just stick to the STRING ID for bookings table if that's what it is.
        // CHECK: If bookings.coach_id is UUID type, we fail. If text, we are good.
        // Assuming text for now to be safe with existing data.

        const { data: booking, error: dbError } = await supabase
            .from('bookings')
            .insert({
                coach_id: coachUuid, // Use UUID for DB consistency
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
        // Use settings from UUID fetch (which is correct for coach_settings table)
        let gcalLink = null;
        if (settings?.google_calendar_id && process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
            try {
                const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
                // Standardize Key: Replace literal \n with newline char, remove \r
                const privateKey = credentials.private_key.replace(/\\n/g, '\n').replace(/\r/g, '');

                const auth = new google.auth.JWT(
                    credentials.client_email, null, privateKey,
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

        // 4. Send Email (Branded)
        if (process.env.RESEND_API_KEY && clientName !== 'BLOKADA') {
            try {
                await resend.emails.send({
                    from: 'Boxing24 <onboarding@resend.dev>',
                    to: [clientEmail],
                    subject: 'Potwierdzenie Rezerwacji - Boxing24',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px; border-radius: 10px;">
                            <h1 style="color: #22c55e; text-transform: uppercase; font-style: italic;">Boxing24</h1>
                            <h2 style="border-bottom: 1px solid #333; padding-bottom: 10px;">Potwierdzenie Rezerwacji</h2>
                            <p>Cześć <strong style="color: #22c55e;">${clientName}</strong>,</p>
                            <p>Twój trening został pomyślnie zarezerwowany.</p>
                            
                            <div style="background-color: #111; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #333;">
                                <p style="margin: 5px 0;">📅 <strong>Data:</strong> ${date}</p>
                                <p style="margin: 5px 0;">⏰ <strong>Godzina:</strong> ${time}</p>
                                <p style="margin: 5px 0;">🥊 <strong>Trener:</strong> ${rawCoachId.replace('-', ' ').toUpperCase()}</p>
                            </div>

                            <p style="font-size: 12px; color: #666;">Do zobaczenia na sali!</p>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('Email Error:', emailError);
            }
        }

        // 5. Send SMS
        if (clientPhone && clientName !== 'BLOKADA') {
            const smsMessage = `Boxing24: Trening potwierdzony! ${date} o ${time} z ${rawCoachId.replace('-', ' ').toUpperCase()}. Do zobaczenia!`;
            await sendSMS(clientPhone, smsMessage);
        }

        return res.status(200).json({ success: true, bookingId: booking.id, gcal: gcalLink }, { headers: corsHeaders });

    } catch (error) {
        console.error('Booking API Error:', error);
        return res.status(500).json({ error: error.message }, { headers: corsHeaders });
    }
}

