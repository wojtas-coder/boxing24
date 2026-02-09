import { getSupabase } from './_utils.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { triggerEvent, payload } = req.body;

    console.log(`[Cal.com Webhook] Event: ${triggerEvent} | Title: ${payload?.title}`);

    if (triggerEvent === 'BOOKING_CREATED') {
        const supabase = getSupabase();

        try {
            const { startTime, endTime, attendees, organizer, title, description, uid } = payload;

            // Validate payload basics
            if (!attendees || attendees.length === 0 || !organizer) {
                console.error("Invalid Payload Structure from Cal.com");
                return res.status(200).json({ received: true, warning: 'Invalid Structure' });
            }

            const clientEmail = attendees[0].email;
            const clientName = attendees[0].name;
            // Phone might be in different places depending on Cal.com version/config. 
            // Checking responses/customInputs is safer if attendees phone is missing.
            const clientPhone = attendees[0].phoneNumber ||
                (payload.responses ? (payload.responses.phoneNumber?.value || payload.responses.phone?.value) : '') ||
                '';

            const coachEmail = organizer.email;

            // Map Cal.com data to Supabase booking

            // HARDCODED MAP for known coaches. Ideally this would be a DB lookup.
            const COACH_EMAIL_MAP = {
                'wojciech.rewczuk@boxing24.pl': 'e1679220-0798-471b-912e-b1e861e3c30c', // Update with real email
                'wojciech@boxing24.pl': 'e1679220-0798-471b-912e-b1e861e3c30c',
                'adam.bilina@boxing24.pl': 'adam-bilina-id',
                // Fallback to organizer email or generic ID if no match finds nothing
            };

            // Determine Coach ID
            const coachId = COACH_EMAIL_MAP[coachEmail] || coachEmail;

            console.log(`Syncing Booking: ${clientName} (${clientEmail}) with Coach: ${coachId} at ${startTime}`);

            // Insert into Supabase
            // Note: We use 'upsert' based on Cal.com UID stored in 'gcal_event_id' or 'external_id' column if it existed.
            // Since we might not have a dedicated Cal.com column yet, we'll assume standard Insert.
            // If the schema strictly enforces UUID on coach_id, this might fail if coachId is an email.
            // We should check if coachId is UUID-like. If not, maybe use a default or log error.

            const { data, error } = await supabase
                .from('bookings')
                .insert({
                    coach_id: coachId.length > 30 ? coachId : 'e1679220-0798-471b-912e-b1e861e3c30c', // Fallback UUID if email passed and DB checks constraint.
                    client_name: clientName,
                    client_email: clientEmail,
                    client_phone: clientPhone,
                    start_time: startTime,
                    end_time: endTime,
                    status: 'confirmed',
                    notes: `[Cal.com] ${description || ''} | UID: ${uid}`,
                    gcal_event_id: uid
                });

            if (error) {
                console.error("Supabase Insert Error:", error);
            } else {
                console.log("Booking successfully synced to Supabase.");
            }

        } catch (err) {
            console.error("Webhook Processing Error", err);
            return res.status(500).json({ error: 'Internal Processing Error' });
        }
    }

    // Always return 200 to Cal.com to prevent retries
    res.status(200).json({ received: true });
}
