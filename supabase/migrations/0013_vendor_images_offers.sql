-- Migration 0013: vendor images and coupon offers
-- Run in Supabase SQL Editor

-- ─── vendor_images ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vendor_images (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_type   text NOT NULL CHECK (vendor_type IN ('grooming', 'walking')),
  vendor_id     uuid NOT NULL,
  image_url     text NOT NULL,
  is_primary    bool NOT NULL DEFAULT false,
  display_order int  NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_images_vendor
  ON public.vendor_images (vendor_type, vendor_id);

ALTER TABLE public.vendor_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view vendor images
CREATE POLICY "Public can view vendor images"
  ON public.vendor_images FOR SELECT USING (true);

-- Grooming vendors can manage their own images
CREATE POLICY "Grooming vendors can manage own images"
  ON public.vendor_images FOR ALL TO authenticated
  USING (
    vendor_type = 'grooming' AND
    EXISTS (SELECT 1 FROM public.grooming_vendors gv WHERE gv.id = vendor_id AND gv.user_id = auth.uid())
  )
  WITH CHECK (
    vendor_type = 'grooming' AND
    EXISTS (SELECT 1 FROM public.grooming_vendors gv WHERE gv.id = vendor_id AND gv.user_id = auth.uid())
  );

-- Walkers can manage their own images
CREATE POLICY "Walkers can manage own images"
  ON public.vendor_images FOR ALL TO authenticated
  USING (
    vendor_type = 'walking' AND
    EXISTS (SELECT 1 FROM public.pet_walkers pw WHERE pw.id = vendor_id AND pw.user_id = auth.uid())
  )
  WITH CHECK (
    vendor_type = 'walking' AND
    EXISTS (SELECT 1 FROM public.pet_walkers pw WHERE pw.id = vendor_id AND pw.user_id = auth.uid())
  );

-- ─── vendor_offers ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vendor_offers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_type    text NOT NULL CHECK (vendor_type IN ('grooming', 'walking')),
  vendor_id      uuid NOT NULL,
  coupon_code    text NOT NULL,
  title          text NOT NULL,
  discount_type  text NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value numeric(10,2) NOT NULL CHECK (discount_value > 0),
  min_amount     numeric(10,2),
  valid_until    date,
  is_active      bool NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vendor_type, vendor_id, coupon_code)
);

CREATE INDEX IF NOT EXISTS idx_vendor_offers_vendor
  ON public.vendor_offers (vendor_type, vendor_id);

ALTER TABLE public.vendor_offers ENABLE ROW LEVEL SECURITY;

-- Customers see active, non-expired offers
CREATE POLICY "Active offers are publicly viewable"
  ON public.vendor_offers FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until >= CURRENT_DATE));

-- Grooming vendors can manage and see all their own offers
CREATE POLICY "Grooming vendors can manage own offers"
  ON public.vendor_offers FOR ALL TO authenticated
  USING (
    vendor_type = 'grooming' AND
    EXISTS (SELECT 1 FROM public.grooming_vendors gv WHERE gv.id = vendor_id AND gv.user_id = auth.uid())
  )
  WITH CHECK (
    vendor_type = 'grooming' AND
    EXISTS (SELECT 1 FROM public.grooming_vendors gv WHERE gv.id = vendor_id AND gv.user_id = auth.uid())
  );

-- Walkers can manage and see all their own offers
CREATE POLICY "Walkers can manage own offers"
  ON public.vendor_offers FOR ALL TO authenticated
  USING (
    vendor_type = 'walking' AND
    EXISTS (SELECT 1 FROM public.pet_walkers pw WHERE pw.id = vendor_id AND pw.user_id = auth.uid())
  )
  WITH CHECK (
    vendor_type = 'walking' AND
    EXISTS (SELECT 1 FROM public.pet_walkers pw WHERE pw.id = vendor_id AND pw.user_id = auth.uid())
  );

-- ─── coupon tracking on bookings ─────────────────────────────────────────────
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS coupon_code     text,
  ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) DEFAULT 0;

ALTER TABLE public.walker_bookings
  ADD COLUMN IF NOT EXISTS coupon_code     text,
  ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) DEFAULT 0;
