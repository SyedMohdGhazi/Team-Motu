-- Migration 0012: multi-pet support + enhanced pet health fields
-- Run in Supabase SQL Editor

-- 1. Remove the one-pet-per-user constraint so customers can add multiple pets
DROP INDEX IF EXISTS idx_user_pets_user_id;

-- 2. Add health & detail columns
ALTER TABLE public.user_pets
  ADD COLUMN IF NOT EXISTS gender      text CHECK (gender IN ('male', 'female', 'unknown')),
  ADD COLUMN IF NOT EXISTS weight_kg   numeric(5,2) CHECK (weight_kg > 0),
  ADD COLUMN IF NOT EXISTS allergies   text,
  ADD COLUMN IF NOT EXISTS medications text;
