-- Apply this migration in the Supabase SQL editor before enabling checkout.
-- Order data is accessed only by server routes using SUPABASE_SERVICE_ROLE_KEY.
create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  email text not null,
  customer_name text not null,
  phone text not null,
  delivery_address text not null,
  amount_kobo bigint not null check (amount_kobo > 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  fulfillment_status text not null default 'processing'
    check (fulfillment_status in ('processing', 'shipped', 'delivered')),
  carrier text,
  tracking_number text,
  estimated_delivery date,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.marketplace_orders
  add column if not exists fulfillment_status text not null default 'processing'
    check (fulfillment_status in ('processing', 'shipped', 'delivered'));
alter table public.marketplace_orders add column if not exists carrier text;
alter table public.marketplace_orders add column if not exists tracking_number text;
alter table public.marketplace_orders add column if not exists estimated_delivery date;

create index if not exists marketplace_orders_created_idx
  on public.marketplace_orders (created_at desc);

create table if not exists public.marketplace_commission_settings (
  setting_key text primary key default 'default' check (setting_key = 'default'),
  rate_bps integer not null default 500 check (rate_bps between 0 and 5000),
  updated_at timestamptz not null default now()
);

insert into public.marketplace_commission_settings (setting_key, rate_bps)
values ('default', 500)
on conflict (setting_key) do nothing;

alter table public.marketplace_commission_settings enable row level security;
revoke all on public.marketplace_commission_settings from anon, authenticated;
grant all on public.marketplace_commission_settings to service_role;

create table if not exists public.marketplace_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  vendor_id uuid references public.profiles(id) on delete set null,
  product_name text not null,
  store_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_kobo bigint not null check (unit_price_kobo >= 0),
  line_total_kobo bigint not null check (line_total_kobo >= 0),
  commission_rate_bps integer not null default 500 check (commission_rate_bps between 0 and 5000),
  commission_amount_kobo bigint,
  vendor_proceeds_kobo bigint
);

alter table public.marketplace_order_items add column if not exists vendor_id uuid references public.profiles(id) on delete set null;
-- Existing orders predate this commission policy, so preserve them at 0%;
-- new checkout requests snapshot the configured rate explicitly.
alter table public.marketplace_order_items add column if not exists commission_rate_bps integer not null default 0 check (commission_rate_bps between 0 and 5000);
alter table public.marketplace_order_items add column if not exists commission_amount_kobo bigint;
alter table public.marketplace_order_items add column if not exists vendor_proceeds_kobo bigint;

update public.marketplace_order_items as item
set vendor_id = product.vendor_id
from public.products as product
where item.product_id = product.id and item.vendor_id is null;

update public.marketplace_order_items
set commission_amount_kobo = round(line_total_kobo * commission_rate_bps / 10000.0)::bigint,
    vendor_proceeds_kobo = line_total_kobo - round(line_total_kobo * commission_rate_bps / 10000.0)::bigint
where commission_amount_kobo is null or vendor_proceeds_kobo is null;

alter table public.marketplace_order_items alter column commission_amount_kobo set not null;
alter table public.marketplace_order_items alter column vendor_proceeds_kobo set not null;

create index if not exists marketplace_order_items_order_idx
  on public.marketplace_order_items (order_id);

create table if not exists public.marketplace_order_tracking_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  status text not null check (status in ('processing', 'shipped', 'delivered')),
  note text not null,
  carrier text,
  tracking_number text,
  actor_uid uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists marketplace_order_tracking_order_idx
  on public.marketplace_order_tracking_events (order_id, created_at asc);

create table if not exists public.marketplace_commissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  order_item_id uuid not null unique references public.marketplace_order_items(id) on delete cascade,
  vendor_id uuid references public.profiles(id) on delete set null,
  store_name text not null,
  gross_amount_kobo bigint not null check (gross_amount_kobo >= 0),
  commission_rate_bps integer not null check (commission_rate_bps between 0 and 5000),
  commission_amount_kobo bigint not null check (commission_amount_kobo >= 0),
  vendor_proceeds_kobo bigint not null check (vendor_proceeds_kobo >= 0),
  earned_at timestamptz not null default now(),
  payout_status text not null default 'pending' check (payout_status in ('pending', 'paid')),
  paid_at timestamptz,
  paid_by uuid references auth.users(id) on delete set null
);

alter table public.marketplace_commissions add column if not exists paid_by uuid references auth.users(id) on delete set null;

create index if not exists marketplace_commissions_earned_idx
  on public.marketplace_commissions (earned_at desc);
create index if not exists marketplace_commissions_vendor_payout_idx
  on public.marketplace_commissions (vendor_id, payout_status);

alter table public.marketplace_orders enable row level security;
alter table public.marketplace_order_items enable row level security;
alter table public.marketplace_order_tracking_events enable row level security;
alter table public.marketplace_commissions enable row level security;
revoke all on public.marketplace_orders from anon, authenticated;
revoke all on public.marketplace_order_items from anon, authenticated;
revoke all on public.marketplace_order_tracking_events from anon, authenticated;
revoke all on public.marketplace_commissions from anon, authenticated;
grant all on public.marketplace_orders to service_role;
grant all on public.marketplace_order_items to service_role;
grant all on public.marketplace_order_tracking_events to service_role;
grant all on public.marketplace_commissions to service_role;

create or replace function public.update_marketplace_order_tracking(
  p_order_id uuid,
  p_status text,
  p_carrier text,
  p_tracking_number text,
  p_estimated_delivery date,
  p_note text,
  p_actor_uid uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_payment_status text;
  current_fulfillment_status text;
  new_note text;
begin
  select status, fulfillment_status
    into current_payment_status, current_fulfillment_status
    from public.marketplace_orders
    where id = p_order_id
    for update;

  if not found then
    raise exception 'Order not found';
  end if;
  if current_payment_status <> 'paid' then
    raise exception 'Only paid orders can be shipped';
  end if;
  if p_status is null or p_status not in ('shipped', 'delivered') then
    raise exception 'Invalid tracking status';
  end if;
  if not (
    (current_fulfillment_status = 'processing' and p_status = 'shipped')
    or (current_fulfillment_status = 'shipped' and p_status = 'delivered')
  ) then
    raise exception 'Order tracking can only move from processing to shipped to delivered';
  end if;

  update public.marketplace_orders
    set fulfillment_status = p_status,
        carrier = coalesce(nullif(trim(p_carrier), ''), carrier),
        tracking_number = coalesce(nullif(trim(p_tracking_number), ''), tracking_number),
        estimated_delivery = coalesce(p_estimated_delivery, estimated_delivery)
    where id = p_order_id;

  new_note := nullif(trim(p_note), '');
  if new_note is null then
    new_note := case p_status
      when 'shipped' then 'Your order has been shipped.'
      else 'Your order has been delivered.'
    end;
  end if;

  insert into public.marketplace_order_tracking_events
    (order_id, status, note, carrier, tracking_number, actor_uid)
  values
    (p_order_id, p_status, new_note, nullif(trim(p_carrier), ''),
     nullif(trim(p_tracking_number), ''), p_actor_uid);

  if p_status = 'delivered' then
    insert into public.marketplace_commissions
      (order_id, order_item_id, vendor_id, store_name, gross_amount_kobo,
       commission_rate_bps, commission_amount_kobo, vendor_proceeds_kobo)
    select p_order_id, item.id, item.vendor_id, item.store_name,
           item.line_total_kobo, item.commission_rate_bps,
           item.commission_amount_kobo, item.vendor_proceeds_kobo
      from public.marketplace_order_items as item
      where item.order_id = p_order_id
    on conflict (order_item_id) do nothing;
  end if;
end;
$$;

revoke all on function public.update_marketplace_order_tracking(uuid, text, text, text, date, text, uuid) from public;
grant execute on function public.update_marketplace_order_tracking(uuid, text, text, text, date, text, uuid) to service_role;
