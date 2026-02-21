-- KOMPLETNE ZABEZPIECZENIAMI RLS DLA SKLEPU PUNCHIN (PRODUCTS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Czyszczenie starych, szczątkowych polityk
DROP POLICY IF EXISTS "Enable ALL for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Public products viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Admin full access" ON public.products;

-- 1. KLIENCI (Anonimowi i wszyscy inni): Mogą tylko czytać asortyment, który ma status "is_active = true"
CREATE POLICY "Public products viewable by everyone" 
ON public.products 
FOR SELECT 
USING (is_active = true);

-- 2. ADMINISTRATOR: Ma pełen dostęp (Odczyt, Dodawanie, Edycja, Usuwanie) bez warunku is_active
CREATE POLICY "Admin full access" 
ON public.products 
FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');
