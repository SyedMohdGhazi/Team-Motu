-- Create public storage bucket for vendor-uploaded images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-images', 'vendor-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow any authenticated user to upload
CREATE POLICY IF NOT EXISTS "authenticated users can upload vendor images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'vendor-images');

-- Allow public read (bucket is public, but object policy needed too)
CREATE POLICY IF NOT EXISTS "vendor images are publicly readable"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'vendor-images');

-- Allow uploaders to replace their own files
CREATE POLICY IF NOT EXISTS "authenticated users can update vendor images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'vendor-images');
