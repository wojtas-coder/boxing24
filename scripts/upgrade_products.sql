-- upgrade_products.sql
-- Uruchom ten skrypt w Supabase SQL Editor aby włączyć PRO funkcje e-commerce

-- 1. Dodanie profesjonalnych kolumn e-commerce do tabeli produktów
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS old_price TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Uncategorized';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 10;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_preorder BOOLEAN DEFAULT false;

-- 2. Usunięcie starych tymczasowych polityk bezpieczeństwa (Zabezpieczenie Bazy!)
DROP POLICY IF EXISTS "Temp Upload" ON storage.objects;
DROP POLICY IF EXISTS "Temp Upload Update" ON storage.objects;
DROP POLICY IF EXISTS "Temp Insert" ON public.products;
DROP POLICY IF EXISTS "Temp Update" ON public.products;
