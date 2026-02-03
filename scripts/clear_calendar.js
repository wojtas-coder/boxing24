import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sltxwuaxueqcdlkseqgl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdHh3dWF4dWVxY2Rsa3NlcWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNzc5ODIsImV4cCI6MjA4NDc1Mzk4Mn0.leriGRlCVJBWqj1jAhI32KgmmLhcs1kWrRLNKR06Bcc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function clearCalendar() {
    console.log('🧹 Clearing calendar_events table...');

    // Delete ALL events to start fresh (User wants to remove foreign ones)
    const { error } = await supabase
        .from('calendar_events')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) console.error('❌ Error:', error);
    else console.log('✅ Calendar cleared.');
}

clearCalendar();
