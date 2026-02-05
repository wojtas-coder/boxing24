
import { getSupabase, corsHeaders } from './_utils.js';
import { startOfDay, endOfDay, parse, format, addMinutes, isBefore, isAfter, isEqual } from 'date-fns';
import { google } from 'googleapis';

// Helper to check if a specific time slot overlaps with any busy range
const isSlotBusy = (slotStart, slotEnd, busyRanges) => {
    return busyRanges.some(range => {
        const busyStart = new Date(range.start);
        const busyEnd = new Date(range.end);
        return (
            (isAfter(slotStart, busyStart) && isBefore(slotStart, busyEnd)) || // Starts inside
            (isAfter(slotEnd, busyStart) && isBefore(slotEnd, busyEnd)) ||   // Ends inside
            (isEqual(slotStart, busyStart)) || // Starts exactly on busy start
            (isBefore(slotStart, busyStart) && isAfter(slotEnd, busyEnd))    // Encloses busy range
        );
    });
};

export default async function handler(req, res) {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).json({}, { headers: corsHeaders });
    }

    const { date, coachId } = req.query; // date in YYYY-MM-DD format

    if (!date || !coachId) {
        return res.status(400).json({ error: 'Missing date or coachId' }, { headers: corsHeaders });
    }

    try {
        const supabase = getSupabase();

        // 1. Get Coach Settings (Hours, Duration)
        const { data: settings, error: settingsError } = await supabase
            .from('coach_settings')
            .select('*')
            .eq('coach_id', coachId)
            .single();

        // Defaults if no settings
        const workStartStr = settings?.work_start_time || '08:00';
        const workEndStr = settings?.work_end_time || '20:00';
        const duration = settings?.session_duration_minutes || 60;

        // 2. Get Bookings for that day
        const dayStart = startOfDay(new Date(date)).toISOString();
        const dayEnd = endOfDay(new Date(date)).toISOString();

        const { data: bookings } = await supabase
            .from('bookings')
            .select('start_time, end_time')
            .eq('coach_id', coachId)
            .neq('status', 'cancelled')
            .gte('start_time', dayStart)
            .lte('end_time', dayEnd);

        // 3. Get Google Calendar Busy Times (if configured)
        let googleBusy = [];
        if (settings?.google_calendar_id && process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
            try {
                const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
                const auth = new google.auth.JWT(
                    credentials.client_email,
                    null,
                    credentials.private_key,
                    ['https://www.googleapis.com/auth/calendar.readonly']
                );
                const calendar = google.calendar({ version: 'v3', auth });
                const response = await calendar.freebusy.query({
                    requestBody: {
                        timeMin: dayStart,
                        timeMax: dayEnd,
                        items: [{ id: settings.google_calendar_id }]
                    }
                });
                const calendars = response.data.calendars;
                if (calendars && calendars[settings.google_calendar_id]) {
                    googleBusy = calendars[settings.google_calendar_id].busy.map(b => ({
                        start: b.start,
                        end: b.end
                    }));
                }
            } catch (gError) {
                console.error('Google Calendar Sync Error:', gError);
                // Continue without GCal if error
            }
        }

        // 4. Generate Slots
        const slots = [];
        let current = parse(`${date} ${workStartStr}`, 'yyyy-MM-dd HH:mm', new Date());
        const end = parse(`${date} ${workEndStr}`, 'yyyy-MM-dd HH:mm', new Date());

        const allBusy = [
            ...(bookings || []).map(b => ({ start: b.start_time, end: b.end_time })),
            ...googleBusy
        ];

        while (isBefore(addMinutes(current, duration), end) || isEqual(addMinutes(current, duration), end)) {
            const slotStart = current;
            const slotEnd = addMinutes(current, duration);

            if (!isSlotBusy(slotStart, slotEnd, allBusy)) {
                slots.push(format(slotStart, 'HH:mm'));
            }

            current = addMinutes(current, 30); // 30 min intervals between start times? Or duration? Let's say 30 min steps.
        }

        return res.status(200).json({ slots }, { headers: corsHeaders });
    } catch (error) {
        console.error('Availability API Error:', error);
        return res.status(500).json({ error: error.message }, { headers: corsHeaders });
    }
}
