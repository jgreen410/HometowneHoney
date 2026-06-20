-- ============================================================================
-- Hometowne Honey — Supabase schema
-- Run this whole file once in the Supabase SQL Editor (Dashboard → SQL Editor).
-- It mirrors src/types/schema.ts so SupabaseApi is a drop-in for MockApi.
-- ============================================================================

-- ---------- Tables ----------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  default_zip text not null default '',
  is_seller boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.directory_listings (
  id text primary key,
  business_name text not null,
  zip_code text not null default '',
  is_claimed boolean not null default false,
  lat double precision,
  lng double precision,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.seller_profiles (
  id text primary key default gen_random_uuid()::text,
  directory_listing_id text references public.directory_listings(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade,
  owner_name text not null default '',
  store_name text,
  fulfillment_methods text[] not null default '{}',
  story text not null default '',
  created_at timestamptz not null default now(),
  unique (directory_listing_id)
);

create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  seller_profile_id text not null references public.seller_profiles(id) on delete cascade,
  name text not null,
  price int not null default 0,         -- cents
  batch_type text not null default '',
  stock_level int not null default 0,
  images text[] not null default '{}'
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  total_amount int not null default 0,  -- cents
  status text not null default 'pending',
  customer_name text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text,
  seller_id text,
  seller_name text,
  name text not null,
  price int not null default 0,
  batch_type text
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  seller_profile_id text not null references public.seller_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, seller_profile_id)
);

create index if not exists idx_seller_profiles_user on public.seller_profiles(user_id);
create index if not exists idx_products_seller on public.products(seller_profile_id);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_seller on public.order_items(seller_id);

-- ---------- New-user trigger: auto-create a profile row ----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Nearest-hives RPC (distance sort) ----------

create or replace function public.find_closest_hives(
  in_lat double precision,
  in_lng double precision,
  in_limit int default 10
)
returns setof public.directory_listings
language sql stable
as $$
  select *
  from public.directory_listings
  where lat is not null and lng is not null
  order by ((lat - in_lat) * (lat - in_lat) + (lng - in_lng) * (lng - in_lng)) asc
  limit in_limit;
$$;

-- SECURITY DEFINER membership helpers (avoid RLS recursion between
-- orders <-> order_items <-> seller_profiles).

create or replace function public.is_order_seller(o uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.order_items oi
    join public.seller_profiles sp on sp.id = oi.seller_id
    where oi.order_id = o and sp.user_id = auth.uid()
  );
$$;

create or replace function public.owns_seller_profile(sp_id text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.seller_profiles sp
    where sp.id = sp_id and sp.user_id = auth.uid()
  );
$$;

-- ---------- Row Level Security ----------

alter table public.profiles            enable row level security;
alter table public.directory_listings  enable row level security;
alter table public.seller_profiles     enable row level security;
alter table public.products            enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.favorites           enable row level security;

-- profiles: a user sees & edits only their own
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (id = auth.uid());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update using (id = auth.uid());

-- directory_listings: public read; any signed-in user may claim (set is_claimed)
drop policy if exists listings_select on public.directory_listings;
create policy listings_select on public.directory_listings for select using (true);
drop policy if exists listings_update on public.directory_listings;
create policy listings_update on public.directory_listings for update using (auth.uid() is not null);

-- seller_profiles: public read; owner writes
drop policy if exists sellers_select on public.seller_profiles;
create policy sellers_select on public.seller_profiles for select using (true);
drop policy if exists sellers_insert on public.seller_profiles;
create policy sellers_insert on public.seller_profiles for insert with check (user_id = auth.uid());
drop policy if exists sellers_update on public.seller_profiles;
create policy sellers_update on public.seller_profiles for update using (user_id = auth.uid());

-- products: public read; only the owning seller writes
drop policy if exists products_select on public.products;
create policy products_select on public.products for select using (true);
drop policy if exists products_write on public.products;
create policy products_write on public.products for all
  using (public.owns_seller_profile(seller_profile_id))
  with check (public.owns_seller_profile(seller_profile_id));

-- orders: buyer sees own; seller sees orders containing their items
drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders for select
  using (buyer_id = auth.uid() or public.is_order_seller(id));
drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders for insert with check (buyer_id = auth.uid());
drop policy if exists orders_update on public.orders;
create policy orders_update on public.orders for update
  using (buyer_id = auth.uid() or public.is_order_seller(id));

-- order_items: visible to the order's buyer or the line's seller
drop policy if exists order_items_select on public.order_items;
create policy order_items_select on public.order_items for select
  using (
    exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
    or public.owns_seller_profile(seller_id)
  );
drop policy if exists order_items_insert on public.order_items;
create policy order_items_insert on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid()));

-- favorites: each user manages their own
drop policy if exists favorites_all on public.favorites;
create policy favorites_all on public.favorites for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Allow the app roles to call the RPCs
grant execute on function public.find_closest_hives(double precision, double precision, int) to anon, authenticated;
grant execute on function public.is_order_seller(uuid) to anon, authenticated;
grant execute on function public.owns_seller_profile(text) to anon, authenticated;
