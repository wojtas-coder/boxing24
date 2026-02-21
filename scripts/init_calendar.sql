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
