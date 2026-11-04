-- Migration 0014: Fix vendor role assignment
-- Root cause: handle_new_user() trigger ignored `is_vendor` metadata,
-- so all vendor signups got role = 'customer' instead of 'vendor'.

-- ─── 1. Fix the trigger function ─────────────────────────────────────────────
-- Now reads is_vendor from auth metadata and sets role accordingly.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    CASE
      WHEN (new.raw_user_meta_data ->> 'is_vendor')::boolean = true
      THEN 'vendor'::public.user_role
      ELSE 'customer'::public.user_role
    END
  );
  RETURN new;
END;
$$;

-- ─── 2. Backfill existing users who have wrong role ──────────────────────────
-- Any user who has a grooming_vendor OR pet_walker profile should be 'vendor'.
UPDATE public.users u
SET role = 'vendor'
WHERE u.role = 'customer'
  AND (
    EXISTS (SELECT 1 FROM public.grooming_vendors gv WHERE gv.user_id = u.id)
    OR EXISTS (SELECT 1 FROM public.pet_walkers pw WHERE pw.user_id = u.id)
  );
