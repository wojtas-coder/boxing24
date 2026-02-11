-- Create a new storage bucket for news images
insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true)
on conflict (id) do nothing;

-- Allow public access to view images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'news-images' );

-- Allow authenticated users (admins) to upload images
create policy "Admin Upload"
on storage.objects for insert
with check ( bucket_id = 'news-images' AND auth.role() = 'authenticated' );

-- Allow authenticated users to update/delete (optional for managing)
create policy "Admin Update"
on storage.objects for update
using ( bucket_id = 'news-images' AND auth.role() = 'authenticated' );

create policy "Admin Delete"
on storage.objects for delete
using ( bucket_id = 'news-images' AND auth.role() = 'authenticated' );
