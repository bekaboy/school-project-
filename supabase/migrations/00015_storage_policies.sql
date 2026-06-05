-- Storage bucket RLS policies
-- Ensure product-images bucket exists and is public
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, false, 2097152, '{image/png,image/jpeg,image/webp}')
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 2097152;

-- Allow authenticated uploads to product-images
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to update their uploads
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
CREATE POLICY "Authenticated users can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

-- Allow public to read product images
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Allow authenticated users to delete product images
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

-- Payment proofs bucket
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('payment-proofs', 'payment-proofs', false, false, 5242880, '{image/png,image/jpeg,image/webp,pdf}')
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to manage payment proofs
DROP POLICY IF EXISTS "Authenticated users can manage payment proofs" ON storage.objects;
CREATE POLICY "Authenticated users can manage payment proofs"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'payment-proofs')
  WITH CHECK (bucket_id = 'payment-proofs');
