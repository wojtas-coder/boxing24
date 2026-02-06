
import { getSupabase, corsHeaders } from './_utils.js';
import { startOfDay, endOfDay, addMinutes, isBefore, isAfter, isEqual, format } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Europe/Warsaw';

const isSlotBusy = (slotStart, slotEnd, busyRanges) => {
    return busyRanges.some(range => {
        const busyStart = new Date(range.start);
        const busyEnd = new Date(range.end);
        return (
            (isAfter(slotStart, busyStart) && isBefore(slotStart, busyEnd)) ||
            (isAfter(slotEnd, busyStart) && isBefore(slotEnd, busyEnd)) ||
            (isEqual(slotStart, busyStart)) ||
            (isBefore(slotStart, busyStart) && isAfter(slotEnd, busyEnd))
        );
    });
};

export default async function handler(req, res) {
    try {
        if (req.method === 'OPTIONS') {
            return res.status(200).json({}, { headers: corsHeaders });
        }

        const debugLogs = [];
        const log = (msg) => {
            console.log(msg);
            debugLogs.push(msg);
        };

        const { date, coachId } = req.query; // date is YYYY-MM-DD

        if (!date || !coachId) {
            return res.status(400).json({ error: 'Missing date or coachId' }, { headers: corsHeaders });
        }

        let supabase = getSupabase();

        // Settings
        let settings = null;
        let workStartStr = '08:00';
        let workEndStr = '20:00';
        let duration = 60;

        const { data: settingsData } = await supabase.from('coach_settings').select('*').eq('coach_id', coachId).single();
        if (settingsData) {
            settings = settingsData;
            workStartStr = (settings.work_start_time || '08:00').slice(0, 5);
            workEndStr = (settings.work_end_time || '20:00').slice(0, 5);
            duration = settings.session_duration_minutes || 60;
        }

        // Bookings Range (UTC)
        // We need to find the start/end of the day IN WARSAW TIME, then convert to UTC for DB query
        const warsawDayStart = fromZonedTime(`${date}T00:00:00`, TIMEZONE);
        const warsawDayEnd = fromZonedTime(`${date}T23:59:59`, TIMEZONE);

        const { data: bookings } = await supabase
            .from('bookings')
            .select('start_time, end_time')
            .eq('coach_id', coachId)
            .neq('status', 'cancelled')
            .gte('start_time', warsawDayStart.toISOString())
            .lte('end_time', warsawDayEnd.toISOString());

        // Google Calendar Busy
        let googleBusy = [];
        if (settings?.google_calendar_id && process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
            try {
                const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
                const auth = new google.auth.JWT(credentials.client_email, null, credentials.private_key, ['https://www.googleapis.com/auth/calendar.readonly']);
                const calendar = google.calendar({ version: 'v3', auth });
                const response = await calendar.freebusy.query({
                    requestBody: {
                        timeMin: warsawDayStart.toISOString(),
                        timeMax: warsawDayEnd.toISOString(),
                        items: [{ id: settings.google_calendar_id }]
                    }
                });
                if (response.data.calendars[settings.google_calendar_id]) {
                    googleBusy = response.data.calendars[settings.google_calendar_id].busy || [];
                }
            } catch (e) { log('GCal Error: ' + e.message); }
        }

        // Generate Slots
        const slots = [];
        // Work Start/End in Warsaw Time
        let current = fromZonedTime(`${date}T${workStartStr}:00`, TIMEZONE);
        const end = fromZonedTime(`${date}T${workEndStr}:00`, TIMEZONE);

        const allBusy = [
            ...(bookings || []).map(b => ({ start: b.start_time, end: b.end_time })),
            ...googleBusy.map(b => ({ start: b.start, end: b.end }))
        ];

        while (isBefore(addMinutes(current, duration), end) || isEqual(addMinutes(current, duration), end)) {
            const slotStart = current;
            const slotEnd = addMinutes(current, duration);

            if (!isSlotBusy(slotStart, slotEnd, allBusy)) {
                // Return time in HH:mm (Warsaw time)
                // We need to format the UTC date BACK to Warsaw time for display
                const displayTime = format(toZonedTime(slotStart, TIMEZONE), 'HH:mm');
                slots.push(displayTime);
            }
            current = addMinutes(current, 30);
        }

        return res.status(200).json({ slots, debug: debugLogs }, { headers: corsHeaders });

    } catch (err) {
        return res.status(500).json({ error: err.message }, { headers: corsHeaders });
    }
}
