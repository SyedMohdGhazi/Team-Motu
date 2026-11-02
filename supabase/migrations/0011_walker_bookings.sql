-- Migration 0011: walker bookings table
-- Run this in Supabase SQL Editor before deploying the booking feature

CREATE TABLE IF NOT EXISTS public.walker_bookings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  walker_id   uuid NOT NULL REFERENCES public.pet_walkers(id) ON DELETE RESTRICT,
  pet_name    text NOT NULL,
  pet_type    text NOT NULL CHECK (pet_type IN ('dog', 'cat', 'other')),
  walk_date   date NOT NULL,
  walk_time   text NOT NULL,
  notes       text,
  status      text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_walker_bookings_user_id   ON public.walker_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_walker_bookings_walker_id ON public.walker_bookings(walker_id);
CREATE INDEX IF NOT EXISTS idx_walker_bookings_status    ON public.walker_bookings(status);

ALTER TABLE public.walker_bookings ENABLE ROW LEVEL SECURITY;

-- Customers can create bookings
CREATE POLICY "Customers can create walk bookings"
  ON public.walker_bookings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Customers can view their own bookings
CREATE POLICY "Customers can view own walk bookings"
  ON public.walker_bookings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Walkers can view bookings assigned to them
CREATE POLICY "Walkers can view their walk bookings"
  ON public.walker_bookings FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pet_walkers pw
      WHERE pw.id = walker_id AND pw.user_id = auth.uid()
    )
  );

-- Walkers can update status of their bookings
CREATE POLICY "Walkers can update walk booking status"
  ON public.walker_bookings FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pet_walkers pw
      WHERE pw.id = walker_id AND pw.user_id = auth.uid()
    )
  );
