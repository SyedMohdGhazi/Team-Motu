-- Add maps_url so vendors can paste a Google Maps link instead of raw lat/lng
ALTER TABLE grooming_vendors ADD COLUMN IF NOT EXISTS maps_url TEXT;
