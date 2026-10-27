-- Migration 0008: medical_stores table + shelter_animals fixes

-- ─── Medical stores ────────────────────────────────────────────────────────
create table public.medical_stores (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  store_name  text not null,
  description text,
  address     text,
  city        text,
  state       text,
  country     text not null default 'India',
  phone       text,
  email       text,
  website_url text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index idx_medical_stores_user_id on public.medical_stores(user_id);
create index idx_medical_stores_city on public.medical_stores(city);
create index idx_medical_stores_active on public.medical_stores(is_active) where is_active = true;

create trigger medical_stores_updated_at
  before update on public.medical_stores
  for each row execute procedure public.handle_updated_at();

alter table public.medical_stores enable row level security;

create policy "Active stores are publicly viewable"
  on public.medical_stores for select using (is_active = true);

create policy "Store owners can view own store"
  on public.medical_stores for select using (auth.uid() = user_id);

create policy "Authenticated users can register a store"
  on public.medical_stores for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Store owners can update own store"
  on public.medical_stores for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── shelter_animals: allow individuals to post without a shelter ──────────
-- Make shelter_id nullable so foster homes / individuals can post pets
alter table public.shelter_animals
  alter column shelter_id drop not null;

-- Track who posted the pet
alter table public.shelter_animals
  add column if not exists posted_by_user_id uuid references public.users(id) on delete set null;

-- Update RLS: allow any authenticated user to add a pet for adoption
drop policy if exists "Admins can manage shelter animals" on public.shelter_animals;

create policy "Authenticated users can add pets for adoption"
  on public.shelter_animals for insert to authenticated
  with check (auth.uid() = posted_by_user_id);

create policy "Anyone can view available pets"
  on public.shelter_animals for select using (true);

create policy "Posted by user can update their own pets"
  on public.shelter_animals for update
  using (auth.uid() = posted_by_user_id);

create policy "Posted by user can delete their own pets"
  on public.shelter_animals for delete
  using (auth.uid() = posted_by_user_id);

create policy "Admins can manage all shelter animals"
  on public.shelter_animals for all
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );
