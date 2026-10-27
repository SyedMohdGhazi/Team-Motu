-- Migration: 0006_create_medical_products.sql

create type public.product_pet_type as enum ('dog', 'cat', 'both');

create table public.medical_products (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  description            text,
  category               text not null,   -- 'medication','supplement','food','flea_tick','grooming_tool','equipment'
  brand                  text,
  price                  numeric(10,2) not null check (price >= 0),
  original_price         numeric(10,2) check (original_price >= 0),
  stock_quantity         integer not null default 0 check (stock_quantity >= 0),
  image_url              text,
  pet_type               public.product_pet_type not null default 'both',
  requires_prescription  boolean not null default false,
  is_active              boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index idx_medical_products_category  on public.medical_products(category);
create index idx_medical_products_pet_type  on public.medical_products(pet_type);
create index idx_medical_products_active    on public.medical_products(is_active) where is_active = true;
create index idx_medical_products_price     on public.medical_products(price);
-- Full-text search index
create index idx_medical_products_fts on public.medical_products
  using gin(to_tsvector('english', name || ' ' || coalesce(description, '') || ' ' || coalesce(brand, '')));

create trigger medical_products_updated_at
  before update on public.medical_products
  for each row execute procedure public.handle_updated_at();

-- Shopping cart (session-based, linked to authenticated user)
create table public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  product_id  uuid not null references public.medical_products(id) on delete cascade,
  quantity    integer not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

create index idx_cart_items_user_id on public.cart_items(user_id);

create trigger cart_items_updated_at
  before update on public.cart_items
  for each row execute procedure public.handle_updated_at();

-- ─── Row Level Security ────────────────────────────────────────────────────
alter table public.medical_products enable row level security;

-- Public read for active products
create policy "Active products are publicly viewable"
  on public.medical_products for select
  using (is_active = true);

-- Only admins can manage products
create policy "Admins can manage medical products"
  on public.medical_products for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

alter table public.cart_items enable row level security;

-- Users can only see and manage their own cart
create policy "Users can view own cart"
  on public.cart_items for select
  using (auth.uid() = user_id);

create policy "Users can add to own cart"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cart items"
  on public.cart_items for update
  using (auth.uid() = user_id);

create policy "Users can delete from own cart"
  on public.cart_items for delete
  using (auth.uid() = user_id);
