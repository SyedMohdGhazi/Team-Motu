-- Add rejection_reason to bookings so vendors can explain why they cancelled
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
