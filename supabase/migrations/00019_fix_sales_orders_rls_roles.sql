-- Fix sales_orders RLS: add missing roles for SELECT and UPDATE
-- The previous policies only included Sales Representative and Technical Manager/Owner,
-- but Finance Officer, Store Manager, and Delivery Driver also need access.

-- SALES ORDERS: All staff roles can view orders
DROP POLICY IF EXISTS "Sales reps can view own orders" ON sales_orders;
CREATE POLICY "Staff can view sales orders"
  ON sales_orders FOR SELECT
  USING (
    sales_rep_id::text = auth.uid()::text OR
    auth.jwt() -> 'user_metadata' ->> 'role' IN (
      'Sales Representative',
      'Finance Officer',
      'Store Manager',
      'Delivery Driver',
      'Technical Manager/Owner'
    )
  );

-- SALES ORDERS: Allow Finance Officer to update (verify/reject), Store Manager to fulfill
DROP POLICY IF EXISTS "Sales reps can update own orders" ON sales_orders;
CREATE POLICY "Staff can update sales orders"
  ON sales_orders FOR UPDATE
  USING (
    sales_rep_id::text = auth.uid()::text OR
    auth.jwt() -> 'user_metadata' ->> 'role' IN (
      'Sales Representative',
      'Finance Officer',
      'Store Manager',
      'Technical Manager/Owner'
    )
  )
  WITH CHECK (
    sales_rep_id::text = auth.uid()::text OR
    auth.jwt() -> 'user_metadata' ->> 'role' IN (
      'Sales Representative',
      'Finance Officer',
      'Store Manager',
      'Technical Manager/Owner'
    )
  );
