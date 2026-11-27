-- Migration: 0020_add_whatsapp_flag.sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_whatsapp boolean NOT NULL DEFAULT false;
ALTER TABLE public.grooming_vendors ADD COLUMN IF NOT EXISTS is_whatsapp boolean NOT NULL DEFAULT false;
