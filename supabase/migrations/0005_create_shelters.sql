-- Migration: 0005_create_shelters.sql

create table public.shelters (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  description         text,
  address             text,
  city                text,
  state               text,
  country             text not null default 'India',
  phone               text,
  email               text,
  website_url         text,
  emergency_helpline  text,
  capacity            integer check (capacity >= 0),
  current_occupancy   integer check (current_occupancy >= 0),
  latitude            double precision,
  longitude           double precision,
  is_ngo              boolean not null default false,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint capacity_check check (
    current_occupancy is null or capacity is null or current_occupancy <= capacity
  )
);

create index idx_shelters_city    on public.shelters(city);
create index idx_shelters_active  on public.shelters(is_active) where is_active = true;
create index idx_shelters_is_ngo  on public.shelters(is_ngo);

create trigger shelters_updated_at
  before update on public.shelters
  for each row execute procedure public.handle_updated_at();

-- Pets available for adoption
create type public.adoption_status as enum ('available', 'pending', 'adopted');

create table public.shelter_animals (
  id              uuid primary key default gen_random_uuid(),
  shelter_id      uuid not null references public.shelters(id) on delete cascade,
  name            text not null,
  species         text not null,           -- 'dog', 'cat', etc.
  breed           text,
  age_years       numeric(4,1) check (age_years >= 0),
  gender          text check (gender in ('male', 'female', 'unknown')),
  description     text,
  image_url       text,
  is_vaccinated   boolean not null default false,
  is_neutered     boolean not null default false,
  adoption_status public.adoption_status not null default 'available',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_shelter_animals_shelter_id on public.shelter_animals(shelter_id);
create index idx_shelter_animals_status     on public.shelter_animals(adoption_status);
create index idx_shelter_animals_species    on public.shelter_animals(species);

create trigger shelter_animals_updated_at
  before update on public.shelter_animals
  for each row execute procedure public.handle_updated_at();

-- ─── Row Level Security ────────────────────────────────────────────────────
alter table public.shelters enable row level security;

-- Public read access for shelters
create policy "Shelters are publicly viewable"
  on public.shelters for select
  using (is_active = true);

-- Only admins can manage shelters
create policy "Admins can manage shelters"
  on public.shelters for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

alter table public.shelter_animals enable row level security;

create policy "Shelter animals are publicly viewable"
  on public.shelter_animals for select
  using (true);

create policy "Admins can manage shelter animals"
  on public.shelter_animals for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
