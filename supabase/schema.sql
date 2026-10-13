create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  store_name text not null,
  role text not null default 'vendor' check (role = 'vendor'),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'suspended')),
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.profiles(id) on delete cascade,
  vendor_name text not null,
  store_name text not null,
  vendor_status text not null default 'approved'
    check (vendor_status in ('approved', 'suspended')),
  name text not null,
  category text not null,
  description text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text not null default '',
  image_path text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists products_vendor_created_idx
  on public.products (vendor_id, created_at desc);
create index if not exists products_status_created_idx
  on public.products (vendor_status, created_at desc);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.profiles(id) on delete set null,
  actor_uid uuid references auth.users(id) on delete set null,
  actor text not null,
  type text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_vendor_created_idx
  on public.activity_logs (vendor_id, created_at desc);
create index if not exists activity_logs_created_idx
  on public.activity_logs (created_at desc);

create or replace function public.is_marketplace_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.marketplace_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_marketplace_admin() from public;
grant execute on function public.is_marketplace_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.marketplace_admins enable row level security;
alter table public.products enable row level security;
alter table public.activity_logs enable row level security;

grant select on public.profiles to authenticated;
grant select on public.marketplace_admins to authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select, insert on public.activity_logs to authenticated;

drop policy if exists "Users and admins read vendor profiles" on public.profiles;
create policy "Users and admins read vendor profiles"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_marketplace_admin());

drop policy if exists "Admins review vendor profiles" on public.profiles;
create policy "Admins review vendor profiles"
  on public.profiles for update to authenticated
  using (public.is_marketplace_admin())
  with check (public.is_marketplace_admin());

drop policy if exists "Users can verify their own admin status" on public.marketplace_admins;
create policy "Users can verify their own admin status"
  on public.marketplace_admins for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Public reads approved products" on public.products;
create policy "Public reads approved products"
  on public.products for select to anon, authenticated
  using (
    vendor_status = 'approved'
  );

drop policy if exists "Vendors and admins read their products" on public.products;
create policy "Vendors and admins read their products"
  on public.products for select to authenticated
  using (vendor_id = auth.uid() or public.is_marketplace_admin());

drop policy if exists "Approved vendors publish products" on public.products;
create policy "Approved vendors publish products"
  on public.products for insert to authenticated
  with check (
    vendor_id = auth.uid()
    and vendor_status = 'approved'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.status = 'approved'
    )
  );

drop policy if exists "Approved vendors update their products" on public.products;
create policy "Approved vendors update their products"
  on public.products for update to authenticated
  using (
    public.is_marketplace_admin()
    or (
      vendor_id = auth.uid()
      and exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
          and profiles.status = 'approved'
      )
    )
  )
  with check (
    public.is_marketplace_admin()
    or (
      vendor_id = auth.uid()
      and vendor_status = 'approved'
      and exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
          and profiles.status = 'approved'
      )
    )
  );

drop policy if exists "Vendors and admins delete products" on public.products;
create policy "Vendors and admins delete products"
  on public.products for delete to authenticated
  using (
    public.is_marketplace_admin()
    or (vendor_id = auth.uid() and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.status = 'approved'
    ))
  );

drop policy if exists "Vendors and admins read activity" on public.activity_logs;
create policy "Vendors and admins read activity"
  on public.activity_logs for select to authenticated
  using (vendor_id = auth.uid() or public.is_marketplace_admin());

drop policy if exists "Vendors record their own activity" on public.activity_logs;
create policy "Vendors record their own activity"
  on public.activity_logs for insert to authenticated
  with check (actor_uid = auth.uid() and vendor_id = auth.uid());

create or replace function public.handle_new_vendor()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  vendor_full_name text;
  vendor_store_name text;
begin
  vendor_full_name := coalesce(new.raw_user_meta_data ->> 'full_name', '');
  vendor_store_name := coalesce(new.raw_user_meta_data ->> 'store_name', '');

  insert into public.profiles (id, email, full_name, store_name, role, status)
  values (new.id, coalesce(new.email, ''), vendor_full_name, vendor_store_name, 'vendor', 'pending');

  insert into public.activity_logs (vendor_id, actor_uid, actor, type, description)
  values (new.id, new.id, vendor_full_name, 'signup', vendor_store_name || ' applied to open a shop.');

  return new;
end;
$$;

 drop trigger if exists on_auth_user_created_marketplace on auth.users;
create trigger on_auth_user_created_marketplace
  after insert on auth.users
  for each row execute procedure public.handle_new_vendor();

create or replace function public.handle_product_created()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.activity_logs (vendor_id, actor_uid, actor, type, description)
  values (new.vendor_id, new.vendor_id, new.store_name, 'product_created', new.name || ' was added to the catalog.');
  return new;
end;
$$;

drop trigger if exists on_marketplace_product_created on public.products;
create trigger on_marketplace_product_created
  after insert on public.products
  for each row execute procedure public.handle_product_created();

create or replace function public.review_vendor(p_vendor_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  admin_email text;
  vendor_store_name text;
begin
  if not public.is_marketplace_admin() then
    raise exception 'Only a marketplace admin can review vendors';
  end if;
  if p_status not in ('pending', 'approved', 'suspended') then
    raise exception 'Invalid vendor status';
  end if;

  update public.profiles
  set status = p_status
  where id = p_vendor_id and role = 'vendor'
  returning store_name into vendor_store_name;
  if not found then
    raise exception 'Vendor profile not found';
  end if;

  update public.products
  set vendor_status = case when p_status = 'approved' then 'approved' else 'suspended' end
  where vendor_id = p_vendor_id;

  select email into admin_email from auth.users where id = auth.uid();
  insert into public.activity_logs (vendor_id, actor_uid, actor, type, description)
  values (
    p_vendor_id,
    auth.uid(),
    coalesce(admin_email, 'Marketplace admin'),
    'vendor_' || p_status,
    vendor_store_name || ' was ' || p_status || '.'
  );
end;
$$;

revoke all on function public.review_vendor(uuid, text) from public;
grant execute on function public.review_vendor(uuid, text) to authenticated;

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

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'profiles'
    ) then
    execute 'alter publication supabase_realtime add table public.profiles';
  end if;
end;
$$;
