-- TWORZENIE BUCKETU 'media' DLA WGRYWANYCH ZDJĘĆ
insert into storage.buckets (id, name, public) 
values ('media', 'media', true) 
on conflict (id) do nothing;

-- POLITYKA: Zezwól na wrzucanie plików wszystkim zalogowanym (lub ogólnie)
-- W Supabase, storage.objects to tabela z plikami
create policy "Public Access (Odczyt)"
on storage.objects for select
to public
using ( bucket_id = 'media' );

create policy "Auth Insert (Wgrywanie)"
on storage.objects for insert
to anon, authenticated
with check ( bucket_id = 'media' );
