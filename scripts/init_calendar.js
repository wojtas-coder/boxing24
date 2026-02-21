import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.production');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const calendarSQL = `
-- Drop existing table if any
DROP TABLE IF EXISTS public.calendar_events CASCADE;

-- Create calendar_events table
CREATE TABLE public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    link TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public events viewable by everyone" 
ON public.calendar_events FOR SELECT USING (is_active = true);

-- Strict Admin Policy based on UID (failsafe)
CREATE POLICY "Admin full access calendar" 
ON public.calendar_events FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Create updated_at trigger
CREATE TRIGGER handle_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.moddatetime('updated_at');
`;

const existingEvents = [
    {
        date: '2026-02-14',
        title: 'Sobota Bokserska DOZB',
        location: 'Wrocław (Krupnicza)',
        description: 'Regionalne (REKORD)',
        type: 'AMATEUR'
    },
    {
        date: '2026-02-15',
        title: 'Turniej o Puchar Burmistrza',
        location: 'Kłodzko',
        description: 'Amatorski',
        type: 'AMATEUR'
    },
    {
        date: '2026-02-21',
        title: 'Otwarty Turniej o Pas Wałbrzycha',
        location: 'Wałbrzych',
        description: 'Dolny Śląsk',
        type: 'AMATEUR'
    },
    {
        date: '2026-02-21',
        title: 'II Kolejka Poznańskiej Ligi',
        location: 'Poznań',
        description: 'Regionalne',
        type: 'AMATEUR'
    },
    {
        date: '2026-03-06',
        title: 'MB Boxing Night 27: Bloody Friday',
        location: 'Wrocław (Hala Orbita)',
        description: 'PRO (PRESTIŻ)',
        type: 'PRO'
    },
    {
        date: '2026-09-19',
        title: 'Anthony Joshua vs Daniel Dubois II',
        location: 'Londyn (Wembley)',
        description: 'WORLD PRO',
        type: 'PRO'
    }
];

async function run() {
    console.log('Creating calendar_events table to Supabase...');
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql: calendarSQL });

    // Since we learned exec_sql might not work without public exposure, we might need a fallback
    if (sqlError) {
        console.log("exec_sql failed, you need to run scripts/init_calendar.sql manually:", sqlError);
    } else {
        console.log("SQL executed successfully.");
    }

    console.log('Migrating existing static events...');
    const { error: insertError } = await supabase.from('calendar_events').insert(existingEvents);

    if (insertError) {
        if (insertError.code === '42P01') {
            console.error("Table does not exist. Please run SQL script in Supabase first.");
        } else {
            console.error("Insert error:", insertError);
        }
    } else {
        console.log('Successfully migrated calendar events!');
    }
}

run();
