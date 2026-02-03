
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyA50ggS02Zv4OAtfvDCykj9doTHFBuwu1o';

async function listModels() {
    console.log('🔍 Checking available models...');
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
        const data = await response.json();

        if (data.models) {
            console.log('✅ Available Models:');
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.error('❌ No models found or error:', data);
        }
    } catch (e) {
        console.error('❌ Connection error:', e);
    }
}

listModels();
