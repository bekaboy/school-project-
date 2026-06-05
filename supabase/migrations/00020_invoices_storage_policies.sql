-- RLS policies for invoices storage bucket
-- The bucket is public so PDFs load directly in browser <a> tags

-- Allow authenticated users to upload invoices
CREATE POLICY "Authenticated users can upload invoices"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'invoices' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to select invoices
CREATE POLICY "Authenticated users can view invoices"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'invoices' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to update invoices
CREATE POLICY "Authenticated users can update invoices"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'invoices' AND
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'invoices' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete invoices
CREATE POLICY "Authenticated users can delete invoices"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'invoices' AND
    auth.role() = 'authenticated'
  );
