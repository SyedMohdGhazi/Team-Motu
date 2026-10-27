-- Migration: 0004_create_bookings.sql

create type public.booking_status as enum (
  'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
);

create type public.booking_type as enum ('home', 'clinic');

create table public.bookings (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  vendor_id         uuid not null references public.grooming_vendors(id) on delete restrict,
  service_id        uuid not null references public.services(id) on delete restrict,
  -- Pet information captured at booking time
  pet_name          text not null,
  pet_type          text not null check (pet_type in ('dog', 'cat', 'other')),
  pet_breed         text,
  pet_age_years     numeric(4,1) check (pet_age_years >= 0),
  -- Appointment
  appointment_date  date not null,
  appointment_time  time not null,
  booking_type      public.booking_type not null,
  address           text,          -- required when booking_type = 'home'
  status            public.booking_status not null default 'pending',
  notes             text,
  -- Pricing
  total_price       numeric(10,2) not null check (total_price >= 0),
  platform_commission_pct  numeric(4,2) not null default 15.00,
  platform_commission_amt  numeric(10,2) generated always as (
    round(total_price * platform_commission_pct / 100, 2)
  ) stored,
  vendor_payout_amt numeric(10,2) generated always as (
    round(total_price * (1 - platform_commission_pct / 100), 2)
  ) stored,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_bookings_user_id          on public.bookings(user_id);
create index idx_bookings_vendor_id        on public.bookings(vendor_id);
create index idx_bookings_service_id       on public.bookings(service_id);
create index idx_bookings_status           on public.bookings(status);
create index idx_bookings_appointment_date on public.bookings(appointment_date);
-- Composite: vendor dashboard queries
create index idx_bookings_vendor_date on public.bookings(vendor_id, appointment_date desc);

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.handle_updated_at();

-- ─── Row Level Security ────────────────────────────────────────────────────
alter table public.bookings enable row level security;

-- Customers can view their own bookings
create policy "Customers can view own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

-- Vendors can view bookings for their services
create policy "Vendors can view their bookings"
  on public.bookings for select
  using (
    exists (
      select 1 from public.grooming_vendors gv
      where gv.id = vendor_id and gv.user_id = auth.uid()
    )
  );

-- Customers can create bookings
create policy "Customers can create bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

-- Customers can cancel their own pending bookings
create policy "Customers can cancel own bookings"
  on public.bookings for update
  using (auth.uid() = user_id and status = 'pending')
  with check (status = 'cancelled');

-- Vendors can update status of their bookings (confirm, complete, cancel)
create policy "Vendors can update booking status"
  on public.bookings for update
  using (
    exists (
      select 1 from public.grooming_vendors gv
      where gv.id = vendor_id and gv.user_id = auth.uid()
    )
  );

-- Admins have full access
create policy "Admins have full booking access"
  on public.bookings for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
