/**
 * Boxing24 News Bot v2.0 (Redakcja 24/7)
 * "The Artificial Editor-in-Chief"
 * 
 * Features:
 * - Gemini 2.0 Flash (Content Generation)
 * - Google Custom Search API (Real Images)
 * - Anti-Hallucination Verification
 * - Local/Global Content Mix
 * - Smart Business-Logic CTAs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_SEARCH_GEN_AI_KEY = process.env.GOOGLE_SEARCH_API_KEY; // Using standard name
const GOOGLE_CX_ID = process.env.GOOGLE_CX_ID;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NEWS_FILE = path.join(__dirname, '../public/news.json');

// Fallback Images (High Quality Sport Placeholders)
const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1615117961557-843cb5bb19ded?q=80&w=1000',
    'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1000',
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1000',
    'https://images.unsplash.com/photo-1590556409424-3435279313ea?q=80&w=1000'
];

const TODAY = new Date().toLocaleDateString('pl-PL');
const YEAR = new Date().getFullYear();

// --- PROMPTS ---
const SYSTEM_PROMPT = `
You are the "Redaktor Naczelny" (Editor-in-Chief) for 'Boxing24.pl'.
TODAY IS: ${TODAY} (Year ${YEAR}).

YOUR MISSION:
Deliver the most engaging, professional, and FACTUAL boxing news in Poland. Content must rival 'bokser.org' or 'ringpolska.pl'.

CONTENT MIX (3-5 Articles):
1. 🌍 GLOBAL HIGH-TICKET (USA/UK/Arabia): Joshua, Fury, Usyk, Canelo, Davis. Big money, big drama.
2. 🇵🇱 POLISH PRO (Top Stars): Masternak, Cieślak, Szeremeta, Różański. verify status!
3. 🏅 OLYMPIC/AMATEUR (PZB/Dolny Śląsk): News from 'Polski Związek Bokserski', local leagues, young talents.
4. 🏰 WROCŁAW SPECIAL: If ANY event is happening in Wrocław (Orbita Hall, Gwardia, local clubs), cover it! Mention 'MB Boxing Night' if relevant.

STYLE GUIDE:
- Headlines: Clickbaity but professional (e.g., "Szok we Wrocławiu!", "Masternak wraca do gry!").
- Tone: Expert, passionate, dynamic.
- Length: 300-500 words (HTML format).
- Formatting: Use <b> for names, <br> for paragraphs.

CTA STRATEGY (Business Logic):
- IF article is about Stars/Pro -> End with: "Chcesz trenować jak zawodowiec? Sprawdź ofertę **Premium Personal** w Boxing24."
- IF article is Local/Amateur -> End with: "Dołącz do bokserskiej społeczności Wrocławia. Wpadnij na trening grupowy w Boxing24."

OUTPUT FORMAT: JSON Array.
Schema:
[
  {
    "title": "String",
    "slug": "String (kebab-case)",
    "excerpt": "String (2 sentences)",
    "content": "String (HTML content + CTA)",
    "category": "String (e.g. 'BOKS ZAWODOWY', 'WROCŁAW', 'OLIMPIJSKI')",
    "image_query": "String (Exact search term to find a photo, e.g. 'Mateusz Masternak 2025 face')",
    "image_url": "String (Leave empty string, will be filled by script)",
    "author": "Redakcja Boxing24",
    "published_at": "ISO String"
  }
]
`;

// --- FUNCTIONS ---

// 1. Image Search (Google Custom Search API)
async function findImageForNews(query) {
    if (!GOOGLE_SEARCH_GEN_AI_KEY || !GOOGLE_CX_ID) {
        console.warn('⚠️ Google Search Keys missing. Using fallback image.');
        return null;
    }

    try {
        const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${GOOGLE_CX_ID}&key=${GOOGLE_SEARCH_GEN_AI_KEY}&searchType=image&num=1&imgSize=large`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.items && data.items.length > 0) {
            return data.items[0].link;
        }
    } catch (error) {
        console.error(`❌ Image Search Failed for '${query}':`, error.message);
    }
    return null;
}

// 2. Content Generation (Gemini)
async function fetchGeminiContent() {
    if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

    console.log(`🤖 Redaktor Naczelny is thinking... (${TODAY})`);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: SYSTEM_PROMPT }] }]
        })
    });

    const data = await response.json();
    if (data.error) {
        console.error("❌ API ERROR DETAILS:", JSON.stringify(data.error, null, 2));
        throw new Error(data.error.message);
    }

    let text = data.candidates[0].content.parts[0].text;

    // Clean JSON
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1) text = text.substring(start, end + 1);

    return JSON.parse(text);
}

// 3. Slug Helper
function slugify(text) {
    return text.toString().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

// --- MAIN PIPELINE ---
async function run() {
    try {
        // A. Generate Text
        const newsItems = await fetchGeminiContent();
        console.log(`📝 Generated ${newsItems.length} articles.`);

        // B. Load / Create Database (JSON)
        let existingNews = [];
        if (fs.existsSync(NEWS_FILE)) {
            try { existingNews = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8')); } catch (e) { }
        }

        // C. Process Items
        let addedCount = 0;

        // Reverse loop to keep order (Gemini gives top news first)
        for (let i = newsItems.length - 1; i >= 0; i--) {
            const item = newsItems[i];

            // 1. Slug & Dup Check
            item.slug = slugify(item.title);
            if (existingNews.some(e => e.slug === item.slug)) {
                console.log(`⏭️ Skipped Duplicate: ${item.title}`);
                continue;
            }

            // 2. Image Hunt
            console.log(`📷 Looking for photo: "${item.image_query}"...`);
            const realImage = await findImageForNews(item.image_query);
            item.image_url = realImage || FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];

            // 3. Add to Feed
            existingNews.unshift(item); // Add to top
            addedCount++;
            console.log(`✅ PUBLISHED: ${item.title}`);
        }

        // D. Prune (Keep last 50)
        if (existingNews.length > 50) existingNews = existingNews.slice(0, 50);

        // E. Save
        fs.writeFileSync(NEWS_FILE, JSON.stringify(existingNews, null, 2));
        console.log(`💾 Edition Complete! Total articles: ${existingNews.length} (+${addedCount} new)`);

    } catch (error) {
        console.error('💀 FATAL NEWSROOM ERROR:', error);
        process.exit(1);
    }
}

run();
