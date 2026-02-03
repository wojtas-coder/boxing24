
/**
 * Boxing24 Calendar Bot (JSON Edition v3 - MAX POWER)
 * Scrapes schedule and saves to src/data/calendar.json
 * Strict JSON Mode
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyA50ggS02Zv4OAtfvDCykj9doTHFBuwu1o';

// File Path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CALENDAR_FILE = path.join(__dirname, '../src/data/calendar.json');

const TODAY = new Date().toLocaleDateString('pl-PL');

const SYSTEM_PROMPT = `
You remain "Data Ring". TODAY IS: ${TODAY}.
Your goal is to populate the Boxing Calendar with **AT LEAST 10-15 MAJOR FIGHTS**.

SEARCH FOR:
- "World Title Fights 2026"
- "Joshua next fight"
- "Canelo next fight"
- "Usyk next fight"
- "Fury next fight"
- "Beterbiev vs Bivol"
- "Polska Noc Boksu 2026" (Polish Galas)
- "Masternak, Cieślak, Różański fights"

CRITICAL INSTRUCTION:
OUTPUT **ONLY** A VALID JSON ARRAY. 
NO PREAMBLE. NO MARKDOWN. 
Return a rich list of events. Dates must be future (from Feb 2026 onwards).

JSON SCHEMA:
[
  {
    "id": "String (Unique ID e.g. 'event-2026-05-18-usyk')",
    "title": "String (e.g. 'Tyson Fury vs Oleksandr Usyk II')",
    "date": "ISO String (YYYY-MM-DDT00:00:00.000Z)",
    "location": "String (City, Country)",
    "type": "String ('PRO', 'AMATEUR', 'OLYMPIC')",
    "category": "String (Use 'PRO' for most, or 'HEAVYWEIGHT' for big fights)",
    "description": "String (Brief details, e.g. 'WBC World Title')"
  }
]
`;

async function fetchGeminiCalendar() {
    console.log(`📅 [Data Ring] Scanning GLOBAL fight schedule (${TODAY})...`);

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
    if (!data.candidates || data.candidates.length === 0) throw new Error('No content generated.');

    let text = data.candidates[0].content.parts[0].text;

    // Aggressive Cleaning
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');

    if (start !== -1 && end !== -1) {
        text = text.substring(start, end + 1);
    } else {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("❌ JSON Parse Failed.", text.substring(0, 100)); // Log only start
        // Try regex match
        const match = text.match(/\[.*\]/s);
        if (match) return JSON.parse(match[0]);
        throw e;
    }
}

async function saveToCalendarJson(events) {
    console.log(`📂 Processing ${events.length} events...`);

    let existing = [];
    if (fs.existsSync(CALENDAR_FILE)) {
        try {
            existing = JSON.parse(fs.readFileSync(CALENDAR_FILE, 'utf8'));
        } catch (e) {
            existing = [];
        }
    }

    let addedCount = 0;

    for (const event of events) {
        if (!event.date) continue;

        // Normalize Date
        try {
            const dateObj = new Date(event.date);
            if (isNaN(dateObj.getTime())) continue; // Skip invalid dates
        } catch (e) { continue; }

        // Dedup (Loose check)
        const exists = existing.find(e => e.title === event.title && e.date.substring(0, 10) === event.date.substring(0, 10));

        if (!exists) {
            existing.push(event);
            addedCount++;
            console.log(`✅ Added: ${event.title} (${event.date.split('T')[0]})`);
        }
    }

    // Sort
    existing.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Remove old
    const now = new Date();
    const cleanExisting = existing.filter(e => new Date(e.date) >= now);

    fs.writeFileSync(CALENDAR_FILE, JSON.stringify(cleanExisting, null, 2));
    console.log(`💾 Saved! Total events: ${cleanExisting.length} (+${addedCount} new)`);
}

async function run() {
    try {
        const events = await fetchGeminiCalendar();
        await saveToCalendarJson(events);
    } catch (error) {
        console.error('💀 Fatal Error:', error);
    }
}

run();
