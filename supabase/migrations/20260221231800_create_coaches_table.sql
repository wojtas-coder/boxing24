-- Migration: Create Coaches Table
-- Description: Creates a table to store coach profiles, replacing the static src/data/coaches.js file.

CREATE TABLE IF NOT EXISTS public.coaches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    title TEXT,
    image_url TEXT,
    description TEXT,
    specialties JSONB DEFAULT '[]',
    price TEXT,
    cal_link TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active coaches" 
    ON public.coaches FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Allow authenticated full access to coaches" 
    ON public.coaches FOR ALL 
    USING (auth.role() = 'authenticated');

-- Insert Initial Data (From static file)
INSERT INTO public.coaches (name, location, title, image_url, description, specialties, price, cal_link, order_index)
VALUES 
(
    'Wojciech Rewczuk', 
    'Wrocław / Cała Polska', 
    'Twórca Boxing24', 
    'https://treningibokserskie.pl/wp-content/uploads/2025/11/Wojciech-Rewczuk.png', 
    'Twórca systemu Boxing24. Współzałożyciel Underground Boxing Club. Certyfikowany trener II klasy sportowej. Od wielu lat pracuje z zawodnikami i amatorami, skupiając się na technice, pracy na tarczy oraz taktyce ringowej. Stawia na mądry boks: ruch, kontrolę dystansu i skuteczne decyzje w walce.', 
    '["Technika", "Sparingi", "Taktyka"]', 
    '200 PLN', 
    'wojciech',
    1
),
(
    'Adam Bylina', 
    'Biała Podlaska', 
    'Współzałożyciel UBC', 
    -- We can't insert a local import here, so leaving placeholder or empty string, admin can upload it later
    'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=400&auto=format&fit=crop', 
    'Współzałożyciel Underground Boxing Club. Doświadczony trener i zawodnik, ekspert od przygotowania motorycznego i siłowego. W pracy skupia się na poprawnych wzorcach ruchowych, budując fundamenty pod skuteczną walkę. Siła i sprawność to jego priorytet.', 
    '["Motoryka", "Siła", "Wzorce Ruchowe"]', 
    '200 PLN', 
    'adam',
    2
)
ON CONFLICT DO NOTHING;
