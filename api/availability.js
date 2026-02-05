
import { getSupabase, corsHeaders } from './_utils.js';
import { startOfDay, endOfDay, parse, format, addMinutes, isBefore, isAfter, isEqual } from 'date-fns';
import { google } from 'googleapis';

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
    // 0. Global Catch for Import/Init errors
    try {
        if (req.method === 'OPTIONS') {
            return res.status(200).json({}, { headers: corsHeaders });
        }

        const debugLogs = [];
        const log = (msg) => {
            console.log(msg);
            debugLogs.push(msg);
        };

        log('Handler started');

        const { date, coachId } = req.query;

        if (!date || !coachId) {
            return res.status(400).json({ error: 'Missing date or coachId' }, { headers: corsHeaders });
        }

        log(`Params: ${date}, ${coachId}`);

        // 1. Init Supabase
        let supabase;
        try {
            supabase = getSupabase();
            log('Supabase client initialized');
        } catch (err) {
            throw new Error(`Supabase Init Failed: ${err.message}`);
        }

        // 2. Settings
        let settings = null;
        let workStartStr = '08:00';
        let workEndStr = '20:00';
        let duration = 60;

        try {
            const { data, error } = await supabase
                .from('coach_settings')
                .select('*')
                .eq('coach_id', coachId)
                .single();

            if (error) {
                log(`Settings fetch error (or 404): ${error.message} code: ${error.code}`);
            } else {
                settings = data;
                log('Settings found');
            }
        } catch (dbErr) {
            log(`DB Settings Crash: ${dbErr.message}`);
        }

        if (settings) {
            workStartStr = settings.work_start_time || '08:00';
            workEndStr = settings.work_end_time || '20:00';
            duration = settings.session_duration_minutes || 60;
        }

        // 3. Bookings
        const dayStart = startOfDay(new Date(date)).toISOString();
        const dayEnd = endOfDay(new Date(date)).toISOString();
        let bookings = [];

        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('start_time, end_time')
                .eq('coach_id', coachId)
                .neq('status', 'cancelled')
                .gte('start_time', dayStart)
                .lte('end_time', dayEnd);

            if (error) throw error;
            bookings = data || [];
            log(`Bookings fetched: ${bookings.length}`);
        } catch (bkErr) {
            log(`Bookings fetch error: ${bkErr.message}. proceeding with empty list.`);
        }

        // 4. Google Calendar
        let googleBusy = [];
        if (settings?.google_calendar_id && process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
            log('Attempting GCal sync...');
            try {
                // Parse JSON safely
                let credentials;
                try {
                    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
                } catch (jsonErr) {
                    throw new Error('Invalid JSON in GOOGLE_SERVICE_ACCOUNT_JSON');
                }

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

                if (response.data.calendars[settings.google_calendar_id]) {
                    googleBusy = response.data.calendars[settings.google_calendar_id].busy || [];
                    log(`GCal busy slots: ${googleBusy.length}`);
                } else {
                    log('GCal ID not found in response response (permission issue?)');
                }
            } catch (gError) {
                log(`GCal Error: ${gError.message}`);
            }
        } else {
            log('Skipping GCal (no ID or no creds)');
        }

        // 5. Generate Slots
        const slots = [];
        try {
            let current = parse(`${date} ${workStartStr}`, 'yyyy-MM-dd HH:mm', new Date());
            const end = parse(`${date} ${workEndStr}`, 'yyyy-MM-dd HH:mm', new Date());

            const allBusy = [
                ...bookings.map(b => ({ start: b.start_time, end: b.end_time })),
                ...googleBusy.map(b => ({ start: b.start, end: b.end }))
            ];

            log(`Generating slots from ${format(current, 'HH:mm')} to ${format(end, 'HH:mm')}. Busy blocks: ${allBusy.length}`);

            while (isBefore(addMinutes(current, duration), end) || isEqual(addMinutes(current, duration), end)) {
                const slotStart = current;
                const slotEnd = addMinutes(current, duration);

                if (!isSlotBusy(slotStart, slotEnd, allBusy)) {
                    slots.push(format(slotStart, 'HH:mm'));
                }
                current = addMinutes(current, 30);
            }
        } catch (calcErr) {
            throw new Error(`Slot Calculation Error: ${calcErr.message}`);
        }

        return res.status(200).json({ slots, debug: debugLogs }, { headers: corsHeaders });

    } catch (fatalError) {
        console.error('FATAL API ERROR:', fatalError);
        return res.status(500).json({
            error: fatalError.message,
            stack: fatalError.stack
        }, { headers: corsHeaders });
    }
}
