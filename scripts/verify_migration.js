import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

console.log('--- DIAGNOSTIC START ---');
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL Present:', !!url);
console.log('Key Present:', !!key);

if (!url || !key) {
    console.error('CRITICAL: Missing Env Variables. Cannot verify.');
    process.exit(1);
}

const supabase = createClient(url, key);

async function verifyMigration() {
    console.log('--- QUERYING SUPABASE ---');
    const targetUUID = 'e1679220-0798-471b-912e-b1e861e3c30c';
    const oldSlug = 'wojciech-rewczuk';

    // Count New
    const { count: newCount, error: err1 } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('coach_id', targetUUID);

    if (err1) {
        console.error('Error counting New UUID:', err1.message, err1.details);
    } else {
        console.log(`Bookings with UUID (${targetUUID}): ${newCount}`);
    }

    // Count Old
    const { count: oldCount, error: err2 } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('coach_id', oldSlug);

    if (err2) {
        console.error('Error counting Old Slug:', err2.message, err2.details);
    } else {
        console.log(`Bookings with Slug (${oldSlug}): ${oldCount}`);
    }

    if (!err1 && !err2 && oldCount === 0 && newCount > 0) {
        console.log('SUCCESS: Migration appears complete. Ecosystem Synchronized.');
    } else if (newCount === 0 && oldCount === 0) {
        console.log('WARNING: No bookings found at all. Maybe table is empty?');
    } else {
        console.log('WARNING: Migration might be incomplete or failed.');
    }
}

verifyMigration();
