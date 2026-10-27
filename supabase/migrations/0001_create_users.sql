-- Migration: 0001_create_users.sql
-- Extends Supabase auth.users with application-level profile data

create type public.user_role as enum ('customer', 'vendor', 'admin');

create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text,
  phone       text,
  avatar_url  text,
  role        public.user_role not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for role-based queries
create index idx_users_role on public.users(role);
create index idx_users_email on public.users(email);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile row when a user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Row Level Security ────────────────────────────────────────────────────
alter table public.users enable row level security;

-- Anyone can read any user profile (for vendor/shelter listings)
create policy "Public profiles are viewable by everyone"
  on public.users for select
  using (true);

-- Users can only update their own profile
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Users cannot insert directly (handled by trigger)
create policy "Disable direct user insert"
  on public.users for insert
  with check (false);
