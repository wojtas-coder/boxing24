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

const SYSTEM_PROMPT = `
Jesteś "Redaktorem Naczelnym" portalu bokserskiego Boxing24.pl.
Twoim zadaniem jest wygenerowanie 3 newsów bokserskich z dzisiejszego dnia (lub ogólnych newsów ze świata boksu, jeśli brak świeżych).

STYL:
- Profesjonalny, sportowy, dynamiczny.
- Jak na stronach: ringpolska.pl, bokser.org.
- Krzykliwe, ale prawdziwe nagłówki.

FORMAT DANYCH (JSON Array):
[
  {
    "title": "Tytuł newsa",
    "slug": "tytul-newsa-slug",
    "excerpt": "Krótki wstęp (2 zdania).",
    "content": "Treść HTML (używaj <p>, <b>, <br>). Minimum 100 słów.",
    "category": "BOKS ZAWODOWY",
    "image_query": "Temat zdjęcia (np. Tyson Fury face)" 
  }
]

Zwróć TYLKO czysty JSON, bez markdowna.
`;

export const generateDailyNews = async () => {
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
