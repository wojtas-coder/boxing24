/**
 * Boxing24 Daily Calendar Bot
 * Fetches upcoming boxing events (Pro & Amateur) using Gemini Grounding.
 */

import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyA50ggS02Zv4OAtfvDCykj9doTHFBuwu1o';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sltxwuaxueqcdlkseqgl.supabase.co';
// Needs Service Role Key for writing if Table is protected, or Anon if Policy allows.
// Fallback to Anon (Assuming Policy allows INSERT for Anon as per my SQL)
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdHh3dWF4dWVxY2Rsa3NlcWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNzc5ODIsImV4cCI6MjA4NDc1Mzk4Mn0.leriGRlCVJBWqj1jAhI32KgmmLhcs1kWrRLNKR06Bcc';

const TODAY = new Date().toLocaleDateString('pl-PL');

const SYSTEM_PROMPT = `
You are an expert boxing scheduler for 'Boxing24.pl'.
TODAY IS: ${TODAY}.

Your task is to find UPCOMING boxing events for the next 30-60 days.
Focus on two categories:
1. **PRO** (Professional Boxing) - Major world fights and Polish galas.
2. **AMATEUR** (Amateur/Olympic Boxing) - **STRICTLY POLISH EVENTS ONLY**.
   - **CRITICAL SEARCH TARGETS** (You MUST search for these specifically):
     - "Liga Poznańska", "Sobota Bokserska", "Max Liga Bokserska", "Liga Bokserska" (Junior/Cadet).
     - "Pierwszy Krok Bokserski", "Grand Prix", "Mistrzostwa Polski", "Turnieje Kwalifikacyjne", "Suzuki Boxing Night".
     - "Warszawska Granda", "Śląskie Uderzenie", "Okręgowe Turnieje", "Mecze Międzyokręgowe".
   - Search specific sites/keywords: "WOZB terminarz", "ŚZB kalendarz", "PZB zawody", "Boks Olimpijski Polska Facebook".
   - IGNORE international amateur tournaments unless Polish National Team is fighting.
   - Location MUST be in Poland for Amateur events.

Use Google Search to find accurate dates. Perform MULTIPLE searches if necessary to find strictly local events.
Aim for at least 15-20 Polish Amateur events.

Output a SINGLE JSON ARRAY. DO NOT INCLUDE MARKDOWN, EXPLANATIONS, OR CHAT. JUST THE ARRAY:
[
  {
    "title": "String (e.g. 'XX Sobota Bokserska na Śląsku')",
    "date": "ISO String (e.g. '2026-02-21T10:00:00Z')",
    "location": "String (e.g. 'Gliwice, Poland')",
    "category": "AMATEUR",
    "source_url": "String (URL where found)"
  }
]
`;

async function fetchCalendar() {
    console.log(`📅 Fetching Boxing Schedule as of ${TODAY}...`);
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: SYSTEM_PROMPT }] }],
            tools: [{ google_search: {} }]
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    // Parse
    const text = data.candidates[0].content.parts[0].text;
    console.log("Raw Model Output Length:", text.length);
    // console.log("Snippet:", text.substring(0, 100)); // Debug

    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(cleanJson);
    } catch (e) {
        // Try regex fallback to find first [ and last ]
        const firstBracket = cleanJson.indexOf('[');
        const lastBracket = cleanJson.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
            const jsonSub = cleanJson.substring(firstBracket, lastBracket + 1);
            return JSON.parse(jsonSub);
        }
        throw e;
    }
}

async function updateCalendar(events) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log(`🚀 Updating ${events.length} events...`);

    for (const event of events) {
        // Upsert based on title+date? Need unique constraint in DB or manual check.
        // My SQL schema has unique(title, date).
        // Timestamps might differ slightly, so 'date' matching is tricky if ISO includes seconds.
        // We will just try insert and ignore on conflict if mostly identical.

        // Ensure date is valid
        if (!Date.parse(event.date)) continue;

        const { error } = await supabase
            .from('calendar_events')
            .upsert({
                title: event.title,
                date: event.date,
                location: event.location,
                category: event.category,
                source_url: event.source_url
            }, { onConflict: 'title, date', ignoreDuplicates: true });
        // Note: onConflict requires a constraint name or column list that exactly matches a unique index.

        if (error) console.error(`⚠️ Error saving ${event.title}:`, error.message);
        else console.log(`✅ Saved: ${event.date.split('T')[0]} - ${event.title}`);
    }
}

async function run() {
    try {
        const events = await fetchCalendar();
        await updateCalendar(events);
        console.log('🏆 Calendar Update Complete!');
    } catch (err) {
        console.error('💀 Application Error:', err);
    }
}

run();
