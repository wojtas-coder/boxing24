import { execSync, spawn } from 'child_process';

const ENV_VARS = {
    "VITE_SUPABASE_URL": "https://sltxwuaxueqcdlkseqgl.supabase.co",
    "SUPABASE_URL": "https://sltxwuaxueqcdlkseqgl.supabase.co",
    "VITE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdHh3dWF4dWVxY2Rsa3NlcWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNzc5ODIsImV4cCI6MjA4NDc1Mzk4Mn0.leriGRlCVJBWqj1jAhI32KgmmLhcs1kWrRLNKR06Bcc",
    "SUPABASE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdHh3dWF4dWVxY2Rsa3NlcWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNzc5ODIsImV4cCI6MjA4NDc1Mzk4Mn0.leriGRlCVJBWqj1jAhI32KgmmLhcs1kWrRLNKR06Bcc",
    "GEMINI_API_KEY": "AIzaSyDu9P1e2-bNmaOFQe2C7N-q3xbj8752DMc",
    "GOOGLE_SEARCH_API_KEY": "AIzaSyDu9P1e2-bNmaOFQe2C7N-q3xbj8752DMc",
    "GOOGLE_CX_ID": "25ee53714efbf4cc9"
};

async function run() {
    for (const [key, value] of Object.entries(ENV_VARS)) {
        console.log(`🔧 Fixing ${key}...`);

        // 1. Remove existing (ignore error if missing)
        try {
            execSync(`echo y | npx vercel env rm ${key} production`, { stdio: 'ignore' });
        } catch (e) { }

        // 2. Add clean value
        await new Promise((resolve, reject) => {
            const child = spawn('npx', ['vercel', 'env', 'add', key, 'production'], { shell: true });

            child.stdin.write(value);
            child.stdin.end();

            child.on('close', (code) => {
                if (code === 0) {
                    console.log(`✅ ${key} fixed.`);
                    resolve();
                } else {
                    console.error(`❌ Failed to add ${key}`);
                    resolve(); // Continue anyway
                }
            });
        });
    }
    console.log("🎉 All variables cleaned!");
}

run();
