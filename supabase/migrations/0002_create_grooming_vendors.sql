-- Migration: 0002_create_grooming_vendors.sql

create table public.grooming_vendors (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.users(id) on delete cascade,
  business_name        text not null,
  description          text,
  address              text,
  city                 text,
  state                text,
  country              text not null default 'India',
  phone                text,
  email                text,
  website_url          text,
  rating               numeric(2,1) not null default 0.0 check (rating >= 0 and rating <= 5),
  total_reviews        integer not null default 0 check (total_reviews >= 0),
  is_verified          boolean not null default false,
  is_active            boolean not null default true,
  offers_home_service  boolean not null default false,
  offers_clinic_visit  boolean not null default true,
  -- Geolocation for distance-based queries
  latitude             double precision,
  longitude            double precision,
  -- PostGIS geography point (requires PostGIS extension — optional)
  -- location            geography(Point, 4326) generated always as (
  --   st_point(longitude, latitude)::geography
  -- ) stored,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- One vendor profile per user
create unique index idx_grooming_vendors_user_id on public.grooming_vendors(user_id);

create index idx_grooming_vendors_city    on public.grooming_vendors(city);
create index idx_grooming_vendors_active  on public.grooming_vendors(is_active) where is_active = true;
create index idx_grooming_vendors_rating  on public.grooming_vendors(rating desc);

create trigger grooming_vendors_updated_at
  before update on public.grooming_vendors
  for each row execute procedure public.handle_updated_at();

-- ─── Row Level Security ────────────────────────────────────────────────────
alter table public.grooming_vendors enable row level security;

-- Everyone can see active vendor profiles
create policy "Active vendors are publicly viewable"
  on public.grooming_vendors for select
  using (is_active = true);

-- Vendors can see their own inactive profile too
create policy "Vendors can view own profile"
  on public.grooming_vendors for select
  using (auth.uid() = user_id);

-- Only the owning vendor can insert their profile
create policy "Vendors can create own profile"
  on public.grooming_vendors for insert
  with check (auth.uid() = user_id);

-- Only the owning vendor can update their profile
create policy "Vendors can update own profile"
  on public.grooming_vendors for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Only admins can delete vendor profiles
create policy "Admins can delete vendor profiles"
  on public.grooming_vendors for delete
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
