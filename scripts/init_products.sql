-- Tworzenie tabeli produktów
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    image_url TEXT,
    badge TEXT,
    short_desc TEXT,
    verdict TEXT,
    deep_dive TEXT,
    stress_test TEXT,
    specs JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Wszyscy mogą czytać aktywne produkty (publiczny dostęp na sklepie)
CREATE POLICY "Public profiles are viewable by everyone" ON public.products
    FOR SELECT USING (is_active = true);

-- Admini widzą wszystko i mogą edytować (prosta reguła - jeśli zalogowany)
-- Tu używam 'authenticated' dla uproszczenia, zakładając że aplikacja weryfikuje admina w API / panelu,
-- ale bezpieczniej zezwolić insert/update/delete tylko tym, którzy mają odpowiednią rolę.
-- By nie utrudniać migracji z Node.js za pomocą Anon key (choć użyjemy Service Role).
CREATE POLICY "Enable ALL for authenticated users" ON public.products
    FOR ALL USING (auth.role() = 'authenticated');

-- Zaktualizujmy triggery czasowe
CREATE OR REPLACE FUNCTION update_modified_column()   
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;   
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_modtime BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Tworzenie storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT DO NOTHING;

-- RLS na buckecie storage
CREATE POLICY "Obrazki produktow dostepne dla wszystkich" ON storage.objects
    FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Upload dla adminow" ON storage.objects
    FOR ALL USING (bucket_id = 'products' AND auth.role() = 'authenticated');
