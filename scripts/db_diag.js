
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sltxwuaxueqcdlkseqgl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdHh3dWF4dWVxY2Rsa3NlcWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNzc5ODIsImV4cCI6MjA4NDc1Mzk4Mn0.leriGRlCVJBWqj1jAhI32KgmmLhcs1kWrRLNKR06Bcc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log("🔍 Checking Database Bookings (Direct Connection)...");

    const { count, error } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error("❌ Query Error:", error.message);
    } else {
        console.log(`✅ Bookings Table Row Count: ${count}`);
    }
}

check();
