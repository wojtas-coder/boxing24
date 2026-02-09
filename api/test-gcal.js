
import { google } from 'googleapis';

const TIMEZONE = 'Europe/Warsaw';

export default async function handler(req, res) {
    let debugInfo = { step: 'init' }; // Init outer scope
    try {
        // Bypass Env Vars - Use Hardcoded File
        const { serviceAccount } = require('./_google_credentials.js');
        const credentials = serviceAccount;

        // Note: In production, we'd normally validte env vars, but we are bypassing for stability now.
        if (!credentials) {
            throw new Error("Credentials module failed to load");
        }

        const email = credentials.client_email;
        debugInfo.clientEmail = email;

        let privateKey = credentials.private_key;

        if (privateKey) {
            debugInfo.privateKeyStart = privateKey.substring(0, 30);
            debugInfo.privateKeyEnd = privateKey.substring(privateKey.length - 30);

            // Basic cleanup just in case
            if (privateKey.indexOf('\\n') !== -1) {
                privateKey = privateKey.replace(/\\n/g, '\n');
            }
            privateKey = privateKey.replace(/\r/g, '');
        }

        // 2. Auth Test (Standard GoogleAuth)
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: email,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/calendar.events'],
        });

        let client;
        try {
            client = await auth.getClient();
        } catch (authErr) {
            return res.status(500).json({
                error: 'Authentication Failed (GoogleAuth)',
                message: authErr.message,
                debug: debugInfo
            });
        }

        // 3. Calendar ID Test
        const calendarId = req.query.calendarId || 'wojtekrewczuk@gmail.com';
        if (!calendarId) {
            return res.status(400).json({ error: 'Missing calendarId parameter.', debug: debugInfo });
        }

        const calendar = google.calendar({ version: 'v3', auth: client });

        // 4. Insert Test Event
        const event = {
            summary: 'Boxing24 Test Event (v7-FINGERPRINT)',
            description: 'To jest testowe wydarzenie (Wersja v7). Jeśli je widzisz - autoryzacja działa!',
            start: {
                dateTime: new Date().toISOString(),
                timeZone: TIMEZONE,
            },
            end: {
                dateTime: new Date(Date.now() + 3600000).toISOString(),
                timeZone: TIMEZONE,
            },
        };

        const response = await calendar.events.insert({
            calendarId: calendarId,
            requestBody: event,
        });

        return res.status(200).json({
            success: true,
            message: 'Event inserted successfully! (New Key Loaded)',
            link: response.data.htmlLink,
            calendarId: calendarId,
            debug: debugInfo,
            keyFingerprint: debugInfo.privateKeyEnd, // Explicitly show this
            version: 'v8-HARDCODED',
            buildTimestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("GCal Test Error:", error);
        return res.status(500).json({
            error: 'Google Calendar Error',
            message: error.message,
            stack: error.stack,
            debug: debugInfo, // CRITICAL: Include debug info here
            fullError: JSON.stringify(error, null, 2)
        });
    }
}
