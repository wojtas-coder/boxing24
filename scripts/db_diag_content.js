
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sltxwuaxueqcdlkseqgl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdHh3dWF4dWVxY2Rsa3NlcWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNzc5ODIsImV4cCI6MjA4NDc1Mzk4Mn0.leriGRlCVJBWqj1jAhI32KgmmLhcs1kWrRLNKR06Bcc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log("🔍 Fetching 1 Booking...");

    // Select coach_id specifically
    const { data, error } = await supabase
        .from('bookings')
        .select('coach_id, client_name, date')
        .limit(1);

    if (error) {
        console.error("❌ Error:", error.message);
    } else {
        console.log("✅ First Booking:", data[0]);
    }
}

check();
