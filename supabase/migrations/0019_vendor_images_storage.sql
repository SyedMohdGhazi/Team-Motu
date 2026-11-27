-- Create public storage bucket for vendor-uploaded images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-images', 'vendor-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies (drop first so this script is re-runnable)
DROP POLICY IF EXISTS "authenticated users can upload vendor images" ON storage.objects;
CREATE POLICY "authenticated users can upload vendor images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'vendor-images');

DROP POLICY IF EXISTS "vendor images are publicly readable" ON storage.objects;
CREATE POLICY "vendor images are publicly readable"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'vendor-images');

DROP POLICY IF EXISTS "authenticated users can update vendor images" ON storage.objects;
CREATE POLICY "authenticated users can update vendor images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'vendor-images');
