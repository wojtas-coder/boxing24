-- Migration: Create Memberships Table
-- Description: Creates a table to store membership tiers (pricing plans).

CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    price TEXT NOT NULL,
    tier TEXT UNIQUE NOT NULL, -- e.g. 'basic', 'pro', 'elite'
    features JSONB DEFAULT '[]',
    recommended BOOLEAN DEFAULT false,
    button_text TEXT,
    action_type TEXT DEFAULT 'link', -- 'link', 'mailto', 'alert'
    action_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active memberships" 
    ON public.memberships FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Allow authenticated full access to memberships" 
    ON public.memberships FOR ALL 
    USING (auth.role() = 'authenticated');

-- Seed Data (from current hardcoded frontend)
INSERT INTO public.memberships (title, price, tier, features, recommended, button_text, action_type, action_url, order_index)
VALUES 
(
    'Digital Pass', 
    '19.99', 
    'basic', 
    '["Pełen dostęp do Boksopedii (Artykuły Premium)", "Nielimitowany dostęp do bazy wiedzy", "Dostęp do Społeczności Discord", "Newsletter Taktyczny"]', 
    false, 
    'Wybierz Pakiet', 
    'alert', 
    'Przekierowanie do płatności subskrypcyjnej...', 
    1
),
(
    'Pro Fighter', 
    '249', 
    'pro', 
    '["Wszystko z pakietu Digital Pass", "Dostęp do Panelu Zawodnika (Member Zone)", "Plan Treningowy (Boks / Motoryka / Hybryda)", "Dziennik Treningowy Online", "1x Konsultacja Wideo (Analiza Techniki) / mc"]', 
    true, 
    'Rozpocznij Współpracę', 
    'link', 
    '/members', 
    2
),
(
    'Elite Mentorship', 
    '1499', 
    'elite', 
    '["Pełna opieka trenerska 24/7", "Indywidualny makrocykl treningowy", "Cotygodniowa Analiza Wideo Twoich walk/sparingów", "Konsultacje dietetyczne i suplementacyjne", "Ebooki i Poradniki Premium w cenie", "Priorytetowy kontakt na WhatsApp", "Spotkania na żywo (opcjonalnie)"]', 
    false, 
    'Aplikuj o Miejsce', 
    'mailto', 
    'High Ticket Mentorship', 
    3
)
ON CONFLICT (tier) DO NOTHING;
