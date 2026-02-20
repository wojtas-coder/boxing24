-- Tymczasowe otwarcie dostępu dla anonimowego skryptu migracyjnego
CREATE POLICY "Temp Upload" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'products');
CREATE POLICY "Temp Upload Update" ON storage.objects FOR UPDATE TO anon USING (bucket_id = 'products');

CREATE POLICY "Temp Insert" ON public.products FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Temp Update" ON public.products FOR UPDATE TO public USING (true);
