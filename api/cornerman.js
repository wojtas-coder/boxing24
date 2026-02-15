
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

// Initialize Gemini
const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;
    const userMessage = messages[messages.length - 1].content;

    try {
        // 1. RAG: Fetch relevant articles from Supabase 'news' table
        let contextData = "";
        try {
            const { data: newsArticles, error } = await supabase
                .from('news')
                .select('title, content, lead, category')
                .or(`content.ilike.%${userMessage}%,title.ilike.%${userMessage}%`)
                .limit(3);

            if (!error && newsArticles && newsArticles.length > 0) {
                contextData = newsArticles.map(a =>
                    `[ARTYKUŁ BOXING24: ${a.title}]\nKategoria: ${a.category || 'News'}\n${a.lead ? `Lead: ${a.lead}\n` : ''}${a.content}`
                ).join("\n\n");
            }
        } catch (ragError) {
            console.error("RAG Error:", ragError);
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `Jesteś CornerMan AI - elitarnym trenerem z Boxing24 we Wrocławiu, ale przede wszystkim TOTALNYM PASJONATEM I EKSPERTEM świata boksu. Żyjesz tą dyscypliną każdą komórką ciała.

TWOJA OSOBOWOŚĆ:
- Jesteś "w narożniku" użytkownika. Wspierasz go, ale też jarasz się każdą wielką walką, newsami i historią boksu.
- Jeśli użytkownik pyta o newsy (np. Joshua, Fury, Gale), odpowiadaj z entuzjazmem eksperta. Analizuj, przewiduj, komentuj najświeższe doniesienia. Nie zbywaj go tylko techniką.
- Twoja wiedza o boksie (zasady, zawodnicy, aktualności) jest nielimitowana. Korzystaj ze swojej ogólnej wiedzy o świecie, jeśli w KONTEKŚCIE nie ma konkretów o danej walce.

REGUŁY KOMUNIKACJI:
1. Używaj żargonu, gdy pasuje: "narożnik", "łańcuch kinetyczny", "slip & roll", "kontra", "balans", "pozycja boczna", "dystans". Robisz to naturalnie, jak ekspert w rozmowie.
2. Jeśli w sekcji KONTEKST są artykuły z boxing24.pl, MUSISZ do nich nawiązać (to Twoja unikalna lokalna wiedza).
3. Nie bój się opinii – jako ekspert masz prawo do merytorycznych przewidywań i analizy formy zawodników.
4. Pisz po polsku, dynamicznie, z bokserskim "pazurem", ale zawsze merytorycznie.
5. Promuj Boxing24 naturalnie w rozmowie. Gdy użytkownik mówi o treningach, technice lub chce się rozwijać – zaproponuj:
   - Treningi personalne we Wrocławiu (strona /booking)
   - Plan Online Premium (strona /membership)
   - Bazę wiedzy na boxing24.pl (/knowledge)
   Rób to z klasą, jako rekomendację eksperta, a nie nachalną reklamę. Np: "Jeśli chcesz postawić na ten element w sparingu, mogę Ci pomóc na żywo – umów się na trening personalny w naszym studio we Wrocławiu."

KONTEKST Z TWOJEJ BAZY WIEDZY BOXING24:
${contextData}`,
        });

        // Gemini history MUST start with 'user' and alternate user/model.
        let chatHistory = messages.slice(0, -1).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
        }));

        // Find the first 'user' message index
        const firstUserIndex = chatHistory.findIndex(m => m.role === 'user');
        if (firstUserIndex > 0) {
            chatHistory = chatHistory.slice(firstUserIndex);
        } else if (firstUserIndex === -1 && chatHistory.length > 0) {
            chatHistory = [];
        }

        const chat = model.startChat({
            history: chatHistory,
        });

        const result = await chat.sendMessageStream(userMessage);

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('CRITICAL Gemini Error:', {
            message: error.message,
            stack: error.stack,
            apiKeyPresent: !!apiKey,
            apiKeyLength: apiKey.length
        });

        // Fixed: use res.status().json() consistently (not new Response())
        return res.status(500).json({
            error: `Błąd CornerMana: ${error.message}. Sprawdź konfigurację API.`
        });
    }
}
