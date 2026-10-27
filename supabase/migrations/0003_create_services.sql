-- Migration: 0003_create_services.sql

create type public.pet_type     as enum ('dog', 'cat', 'both');
create type public.service_type as enum ('home', 'clinic', 'both');

create table public.services (
  id               uuid primary key default gen_random_uuid(),
  vendor_id        uuid not null references public.grooming_vendors(id) on delete cascade,
  name             text not null,
  description      text,
  price            numeric(10,2) not null check (price >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  category         text not null,       -- e.g. 'bath', 'haircut', 'nail_trim', 'full_package'
  pet_type         public.pet_type     not null default 'both',
  service_type     public.service_type not null default 'both',
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_services_vendor_id   on public.services(vendor_id);
create index idx_services_category    on public.services(category);
create index idx_services_pet_type    on public.services(pet_type);
create index idx_services_active      on public.services(is_active) where is_active = true;

create trigger services_updated_at
  before update on public.services
  for each row execute procedure public.handle_updated_at();

-- ─── Row Level Security ────────────────────────────────────────────────────
alter table public.services enable row level security;

-- Anyone can read active services
create policy "Active services are publicly viewable"
  on public.services for select
  using (is_active = true);

-- Vendors can see their own inactive services
create policy "Vendors can view own services"
  on public.services for select
  using (
    exists (
      select 1 from public.grooming_vendors gv
      where gv.id = vendor_id and gv.user_id = auth.uid()
    )
  );

-- Only the owning vendor can manage their services
create policy "Vendors can insert own services"
  on public.services for insert
  with check (
    exists (
      select 1 from public.grooming_vendors gv
      where gv.id = vendor_id and gv.user_id = auth.uid()
    )
  );

create policy "Vendors can update own services"
  on public.services for update
  using (
    exists (
      select 1 from public.grooming_vendors gv
      where gv.id = vendor_id and gv.user_id = auth.uid()
    )
  );

create policy "Vendors can delete own services"
  on public.services for delete
  using (
    exists (
      select 1 from public.grooming_vendors gv
      where gv.id = vendor_id and gv.user_id = auth.uid()
    )
  );
