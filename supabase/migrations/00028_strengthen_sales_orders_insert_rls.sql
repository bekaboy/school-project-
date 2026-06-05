-- Strengthen sales_orders INSERT RLS to enforce sales_rep_id = auth.uid()
-- for Sales Representatives, while allowing Technical Manager/Owner to create
-- orders for any sales rep.

DROP POLICY IF EXISTS "Sales reps can create orders" ON sales_orders;

CREATE POLICY "Sales reps can create orders"
  ON sales_orders FOR INSERT
  WITH CHECK (
    -- Technical Manager/Owner can create orders for any sales rep
    EXISTS (
      SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'Technical Manager/Owner'
    )
    OR
    -- Sales Representative must create orders under their own name
    (
      sales_rep_id::text = auth.uid()::text
      AND
      EXISTS (
        SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'Sales Representative'
      )
    )
  );
