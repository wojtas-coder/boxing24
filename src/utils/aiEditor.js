import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from '../lib/supabaseClient';

// Initialize Gemini Lazy
const getGenAI = () => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
        console.error("Missing Gemini API Key");
        return null;
    }
    return new GoogleGenerativeAI(API_KEY);
};

// ... existing imports

const REFORMAT_PROMPT = `
Jesteś redaktorem "Boxing24.pl". Twoim zadaniem jest sformatowanie i zredagowanie podanego "brudnopisu" lub wklejonego tekstu na profesjonalny news bokserski.

WYTYCZNE:
1. Przeanalizuj wklejony tekst.
2. Napisz chwytliwy, krótki Tytuł (Title).
3. Stwórz unikalny Slug.
4. Napisz Lead (2 zdania zachęty).
5. Treść (Content) sformatuj w HTML (<p>, <b>, <h3>). Podziel na akapity. Popraw styl na sportowy/dziennikarski.
6. Kategoria: Wybierz pasującą (Boks Zawodowy, Olimpijski, etc.).
7. Jeśli w tekście jest wzmianka o autorze, użyj jej, w przeciwnym razie "Redakcja".

FORMAT DANYCH (Czysty JSON):
{
    "title": "...",
    "slug": "...",
    "lead": "...",
    "content": "...",
    "category": "...",
    "author_name": "...",
    "is_breaking": false,
    "source_link": ""
}

Zwróć TYLKO objekt JSON.
`;

export const reformatNews = async (rawText) => {
    try {
        const genAI = getGenAI();
        if (!genAI) throw new Error("Brak klucza API Gemini.");

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([REFORMAT_PROMPT, `TEKST DO PRZEROBIENIA:\n${rawText}`]);
        const response = await result.response;
        let text = response.text();

        // Cleanup JSON
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) text = text.substring(start, end + 1);

        const article = JSON.parse(text);
        return { success: true, data: article };
    } catch (error) {
        console.error("AI Reformat Error:", error);
        return { success: false, error: error.message };
    }
};

export const generateDailyNews = async () => {
    // ... existing implementation kep for reference or fallback
    try {
        console.log("🤖 AI Editor: Starting generation...");

        const genAI = getGenAI();
        if (!genAI) throw new Error("Brak klucza API Gemini (VITE_GEMINI_API_KEY) - sprawdź .env lub ustawienia Vercel.");

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(SYSTEM_PROMPT);
        const response = await result.response;
        let text = response.text();

        // Cleanup JSON
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1 && end !== -1) text = text.substring(start, end + 1);

        const newsItems = JSON.parse(text);
        console.log(`🤖 AI Editor: Generated ${newsItems.length} articles.`);

        // Insert into Supabase
        const processedItems = newsItems.map(item => ({
            ...item,
            author: 'AI Redaktor',
            published_at: new Date().toISOString(),
            image_url: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1000' // Fallback image for now
        }));

        const { data, error } = await supabase
            .from('news')
            .insert(processedItems)
            .select();

        if (error) throw error;

        return { success: true, count: processedItems.length };

    } catch (error) {
        console.error("AI Editor Error:", error);
        return { success: false, error: error.message };
    }
};
