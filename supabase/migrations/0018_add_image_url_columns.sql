-- Add image_url columns to vendor, walker, and service tables
-- Used as fallback when no SVG default is shown; vendors can paste their own photo URL

ALTER TABLE grooming_vendors ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE pet_walkers      ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE services         ADD COLUMN IF NOT EXISTS image_url text;
