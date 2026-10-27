-- Allow any authenticated user to register their own shelter
-- Run this in Supabase SQL Editor

drop policy if exists "Admins can manage shelters" on public.shelters;

-- Anyone authenticated can insert a shelter
create policy "Authenticated users can register shelters"
  on public.shelters for insert
  to authenticated
  with check (true);

-- Anyone can read active shelters (already exists, but re-create to be safe)
drop policy if exists "Shelters are publicly viewable" on public.shelters;
create policy "Shelters are publicly viewable"
  on public.shelters for select
  using (is_active = true);

-- Admins can manage all shelters
create policy "Admins can manage shelters"
  on public.shelters for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
