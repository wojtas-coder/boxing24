
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
            model: "gemini-1.5-flash",
            systemInstruction: `Jesteś CornerMan AI - elitarnym, bezkompromisowym trenerem z Boxing24 we Wrocławiu. 
Twoim celem jest przekazanie twardej, naukowej i taktycznej wiedzy bokserskiej. 

REGUŁY ODPOWIEDZI:
1. Używaj profesjonalnego żargonu: "narożnik", "łańcuch kinetyczny", "slip & roll", "kontra", "balans", "pozycja boczna", "dystans".
2. Jeśli w sekcji KONTEKST są artykuły, MUSISZ do nich nawiązać i z nich korzystać.
3. Nigdy nie odsyłaj do "sekcji VIP" jako jedynej odpowiedzi - zamiast tego daj konkretną wskazówkę techniczną tutaj.
4. Pisz po polsku, krótko, konkretnie i "po boksersku".
5. Znasz ofertę Boxing24 (treningi personalne, Elite Boxing Wrocław).

KONTEKST Z TWOJEJ BAZY WIEDZY:
${contextData}`,
        });

        const chat = model.startChat({
            history: messages.slice(0, -1).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
            })),
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
        console.error('Gemini Error:', error);
        res.status(500).json({ error: 'Błąd połączenia z CornerManem. Spróbuj za chwilę.' });
    }
}
