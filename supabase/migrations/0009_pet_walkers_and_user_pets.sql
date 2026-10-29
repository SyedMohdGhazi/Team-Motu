-- Migration 0009: user_pets table + pet_walkers RLS policies

-- ─── user_pets: customer's own pet profile ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_pets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  type        text NOT NULL CHECK (type IN ('dog', 'cat', 'rabbit', 'bird', 'other')),
  breed       text,
  age_years   numeric,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- One pet profile per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_pets_user_id ON public.user_pets(user_id);

CREATE TRIGGER user_pets_updated_at
  BEFORE UPDATE ON public.user_pets
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

ALTER TABLE public.user_pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pet"
  ON public.user_pets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── pet_walkers: ensure RLS policies allow admin reads ──────────────────────
-- Allow admin users to see ALL walker profiles (including pending/inactive)
CREATE POLICY "Admins can view all pet walkers"
  ON public.pet_walkers FOR SELECT TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Allow walkers to view their own profile
CREATE POLICY "Walker owners can view own profile"
  ON public.pet_walkers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Allow any authenticated user to see active/approved walkers (for listings page)
CREATE POLICY "Active walkers are publicly viewable"
  ON public.pet_walkers FOR SELECT
  USING (is_active = true AND approval_status = 'approved');

-- Allow walkers to update their own profile
CREATE POLICY "Walker owners can update own profile"
  ON public.pet_walkers FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow admins to update any walker (for approve/reject)
CREATE POLICY "Admins can update all pet walkers"
  ON public.pet_walkers FOR UPDATE TO authenticated
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );
