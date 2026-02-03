
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sltxwuaxueqcdlkseqgl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdHh3dWF4dWVxY2Rsa3NlcWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNzc5ODIsImV4cCI6MjA4NDc1Mzk4Mn0.leriGRlCVJBWqj1jAhI32KgmmLhcs1kWrRLNKR06Bcc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAccess() {
    console.log('🕵️ Checking public access to "news" table...');

    // 1. Try to read
    const { data, error } = await supabase
        .from('news')
        .select('id, title, created_at')
        .limit(5);

    if (error) {
        console.error('❌ Access Denied / Error:', error.message);
        console.log('👉 RLS Policy issue? Or table missing?');
    } else {
        console.log(`✅ Success! Found ${data.length} articles.`);
        if (data.length > 0) {
            console.log('Latest:', data[0].title);
        } else {
            console.log('⚠️ Array is empty. Table might be empty or RLS hides rows.');
        }
    }
}

checkAccess();
