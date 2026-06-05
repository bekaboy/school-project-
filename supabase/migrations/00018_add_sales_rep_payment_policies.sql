-- Make payment-proofs bucket public so images load in the browser
UPDATE storage.buckets SET public = true WHERE id = 'payment-proofs';

-- Allow sales reps to create payment records for their orders
DROP POLICY IF EXISTS "Sales reps can create payments for own orders" ON payments;
CREATE POLICY "Sales reps can create payments for own orders"
  ON payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales_orders WHERE id = payments.order_id AND (
        sales_rep_id::text = auth.uid()::text OR
        auth.jwt() -> 'user_metadata' ->> 'role' = 'Technical Manager/Owner'
      )
    )
  );

-- Allow sales reps to view payments for their orders
DROP POLICY IF EXISTS "Sales reps can view payments for own orders" ON payments;
CREATE POLICY "Sales reps can view payments for own orders"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sales_orders WHERE id = payments.order_id AND (
        sales_rep_id::text = auth.uid()::text OR
        auth.jwt() -> 'user_metadata' ->> 'role' IN ('Finance Officer', 'Technical Manager/Owner')
      )
    )
  );
