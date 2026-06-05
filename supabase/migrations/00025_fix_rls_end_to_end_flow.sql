-- Fix RLS gaps uncovered during end-to-end flow testing
-- 1. Delivery Driver cannot update sales_orders status (critical for confirming delivery)
-- 2. Sales Rep cannot UPDATE payments (needed for re-uploading proof)
-- 3. order_items INSERT policy uses users table query (regression from 00024)
-- 4. order_items UPDATE policy missing Finance Officer and Store Manager
-- 5. invoices INSERT policy allows any authenticated user

-- ============================================================
-- 1. SALES ORDERS: Add Delivery Driver to UPDATE policy
-- ============================================================
-- Driver needs to set status to 'Delivered' or 'Failed' when confirming delivery

DROP POLICY IF EXISTS "Staff can update sales orders" ON sales_orders;
CREATE POLICY "Staff can update sales orders"
  ON sales_orders FOR UPDATE
  USING (
    sales_rep_id::text = auth.uid()::text OR
    auth.jwt() -> 'user_metadata' ->> 'role' IN (
      'Sales Representative',
      'Finance Officer',
      'Store Manager',
      'Delivery Driver',
      'Technical Manager/Owner'
    )
  )
  WITH CHECK (
    sales_rep_id::text = auth.uid()::text OR
    auth.jwt() -> 'user_metadata' ->> 'role' IN (
      'Sales Representative',
      'Finance Officer',
      'Store Manager',
      'Delivery Driver',
      'Technical Manager/Owner'
    )
  );

-- ============================================================
-- 2. PAYMENTS: Allow Sales Rep to update own order's payments
-- ============================================================
-- Needed when a Sales Rep re-uploads a corrected payment proof after rejection

DROP POLICY IF EXISTS "Sales reps can create payments for own orders" ON payments;
CREATE POLICY "Sales reps can manage payments for own orders"
  ON payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales_orders WHERE id = payments.order_id AND (
        sales_rep_id::text = auth.uid()::text OR
        auth.jwt() -> 'user_metadata' ->> 'role' = 'Technical Manager/Owner'
      )
    )
  );

CREATE POLICY "Sales reps can update payments for own orders"
  ON payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sales_orders WHERE id = payments.order_id AND (
        sales_rep_id::text = auth.uid()::text OR
        auth.jwt() -> 'user_metadata' ->> 'role' = 'Technical Manager/Owner'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales_orders WHERE id = payments.order_id AND (
        sales_rep_id::text = auth.uid()::text OR
        auth.jwt() -> 'user_metadata' ->> 'role' = 'Technical Manager/Owner'
      )
    )
  );

-- ============================================================
-- 3. ORDER ITEMS: Fix INSERT policy to use JWT role (avoid recursion)
-- ============================================================
-- 00024 reintroduced users table query which can cause infinite recursion

DROP POLICY IF EXISTS "Staff can manage order items" ON order_items;
CREATE POLICY "Staff can manage order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales_orders WHERE id = order_items.order_id AND (
        sales_rep_id::text = auth.uid()::text OR
        auth.jwt() -> 'user_metadata' ->> 'role' IN (
          'Sales Representative',
          'Finance Officer',
          'Store Manager',
          'Technical Manager/Owner'
        )
      )
    )
  );

-- ============================================================
-- 4. ORDER ITEMS: Add Finance Officer and Store Manager to UPDATE policy
-- ============================================================
-- Needed for batch assignment during invoicing and fulfillment

DROP POLICY IF EXISTS "Users can update order items for own orders" ON order_items;
CREATE POLICY "Staff can update order items"
  ON order_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sales_orders WHERE id = order_items.order_id AND (
        sales_rep_id::text = auth.uid()::text OR
        auth.jwt() -> 'user_metadata' ->> 'role' IN (
          'Sales Representative',
          'Finance Officer',
          'Store Manager',
          'Technical Manager/Owner'
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales_orders WHERE id = order_items.order_id AND (
        sales_rep_id::text = auth.uid()::text OR
        auth.jwt() -> 'user_metadata' ->> 'role' IN (
          'Sales Representative',
          'Finance Officer',
          'Store Manager',
          'Technical Manager/Owner'
        )
      )
    )
  );

-- ============================================================
-- 5. INVOICES: Restrict INSERT to Finance Officer and Technical Manager/Owner
-- ============================================================
-- Previously WITH CHECK (true) allowed any authenticated user

DROP POLICY IF EXISTS "System can create invoices" ON invoices;
CREATE POLICY "Finance and admin can manage invoices"
  ON invoices FOR INSERT
  WITH CHECK (
    auth.jwt() -> 'user_metadata' ->> 'role' IN ('Finance Officer', 'Technical Manager/Owner')
  );

DROP POLICY IF EXISTS "Finance and admin can view invoices" ON invoices;
CREATE POLICY "Finance and admin can view invoices"
  ON invoices FOR SELECT
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' IN (
      'Sales Representative',
      'Finance Officer',
      'Store Manager',
      'Delivery Driver',
      'Technical Manager/Owner'
    )
  );

-- ============================================================
-- 6. DELIVERIES SELECT: Add Sales Rep and Finance Officer visibility
-- ============================================================
-- Sales Reps should see delivery status of their own orders
-- Finance Officers should see delivery status for order tracking

DROP POLICY IF EXISTS "Staff can view deliveries" ON deliveries;
CREATE POLICY "Staff can view deliveries"
  ON deliveries FOR SELECT
  USING (
    driver_id::text = auth.uid()::text OR
    auth.jwt() -> 'user_metadata' ->> 'role' IN (
      'Store Manager',
      'Technical Manager/Owner',
      'Finance Officer'
    ) OR
    EXISTS (
      SELECT 1 FROM sales_orders WHERE id = deliveries.order_id AND
        sales_rep_id::text = auth.uid()::text
    )
  );
