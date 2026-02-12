
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
        // 1. RAG: Fetch relevant articles from Supabase
        let contextData = "";
        try {
            const { data: articles, error } = await supabase
                .from('articles')
                .select('title, content')
                .or(`content.ilike.%${userMessage}%,title.ilike.%${userMessage}%`)
                .limit(3);

            if (!error && articles && articles.length > 0) {
                contextData = articles.map(a => `[ARTYKUŁ: ${a.title}]\n${a.content}`).join("\n\n");
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
5. Promuj Boxing24 (treningi we Wrocławiu, Elite Boxing) tylko gdy to naturalnie pasuje do rozmowy.

KONTEKST Z TWOJEJ BAZY WIEDZY BOXING24:
${contextData}`,
        });

        // Gemini history MUST start with 'user' and alternate user/model.
        // If the first message is from 'model' (like the greeting), we skip it or give it a dummy user prefix.
        let chatHistory = messages.slice(0, -1).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
        }));

        // Find the first 'user' message index
        const firstUserIndex = chatHistory.findIndex(m => m.role === 'user');
        if (firstUserIndex > 0) {
            chatHistory = chatHistory.slice(firstUserIndex);
        } else if (firstUserIndex === -1 && chatHistory.length > 0) {
            // If no user message was found in history, clear it
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

        // Return a more descriptive error for debugging (will show up in widget error message)
        return new Response(JSON.stringify({
            error: `Błąd CornerMana: ${error.message}. Sprawdź konfigurację API.`
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
