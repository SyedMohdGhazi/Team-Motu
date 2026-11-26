-- Recreate the services UPDATE policy with an explicit WITH CHECK clause.
-- Without WITH CHECK, PostgreSQL uses USING for both — but Supabase sometimes
-- treats the implied WITH CHECK strictly against the new row, causing
-- "new row violates row-level security policy" on soft-deletes (is_active = false).
-- Explicitly stating WITH CHECK with the same condition resolves this.

DROP POLICY IF EXISTS "Vendors can update own services" ON public.services;

CREATE POLICY "Vendors can update own services"
  ON public.services FOR UPDATE
  USING (
    vendor_id IN (
      SELECT id FROM public.grooming_vendors WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id FROM public.grooming_vendors WHERE user_id = auth.uid()
    )
  );
