insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public reads marketplace product images" on storage.objects;
create policy "Public reads marketplace product images"
  on storage.objects for select to public
  using (bucket_id = 'product-images');

drop policy if exists "Approved vendors upload product images" on storage.objects;
create policy "Approved vendors upload product images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.status = 'approved'
    )
  );

drop policy if exists "Vendors and admins delete product images" on storage.objects;
create policy "Vendors and admins delete product images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (
      public.is_marketplace_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );
