-- Migration 0010: prevent duplicate pet_walker registrations per user

CREATE UNIQUE INDEX IF NOT EXISTS idx_pet_walkers_user_id
  ON public.pet_walkers(user_id);
