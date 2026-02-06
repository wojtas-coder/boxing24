
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sltxwuaxueqcdlkseqgl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdHh3dWF4dWVxY2Rsa3NlcWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNzc5ODIsImV4cCI6MjA4NDc1Mzk4Mn0.leriGRlCVJBWqj1jAhI32KgmmLhcs1kWrRLNKR06Bcc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log("🔍 Scanning Coach IDs in Bookings...");

    const { data, error } = await supabase
        .from('bookings')
        .select('coach_id');

    if (error) {
        console.error("❌ Error:", error.message);
    } else {
        const ids = data.map(d => d.coach_id);
        const unique = [...new Set(ids)];
        console.log("✅ Unique Coach IDs found:", unique);
        console.log("✅ Total Bookings:", ids.length);
    }
}

check();
