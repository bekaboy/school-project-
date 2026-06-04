-- Fix all RLS policies to use email-based user identification
-- Instead of UUID matching (which breaks because seed UUIDs don't match auth.users UUIDs)

-- PRODUCTS
DROP POLICY IF EXISTS "Store managers and admins can manage products" ON products;
CREATE POLICY "Store managers and admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' AND role IN ('Store Manager', 'Technical Manager/Owner')
    )
  );

-- BATCHES
DROP POLICY IF EXISTS "Store managers and admins can manage batches" ON batches;
CREATE POLICY "Store managers and admins can manage batches"
  ON batches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' AND role IN ('Store Manager', 'Technical Manager/Owner')
    )
  );

-- CUSTOMERS
DROP POLICY IF EXISTS "Store managers and admins can manage customers" ON customers;
CREATE POLICY "Store managers and admins can manage customers"
  ON customers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' AND role IN ('Store Manager', 'Technical Manager/Owner')
    )
  );

-- SALES ORDERS
DROP POLICY IF EXISTS "Sales reps can view own orders" ON sales_orders;
DROP POLICY IF EXISTS "Sales reps can create orders" ON sales_orders;

CREATE POLICY "Sales reps can view own orders"
  ON sales_orders FOR SELECT
  USING (
    sales_rep_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' AND role = 'Technical Manager/Owner'
    )
  );

CREATE POLICY "Sales reps can create orders"
  ON sales_orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' AND role IN ('Sales Representative', 'Technical Manager/Owner')
    )
  );

-- ORDER ITEMS
DROP POLICY IF EXISTS "Users can view order items for accessible orders" ON order_items;
DROP POLICY IF EXISTS "Sales reps can create order items" ON order_items;

CREATE POLICY "Users can view order items for accessible orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sales_orders WHERE id = order_items.order_id AND (
        sales_rep_id::text = auth.uid()::text OR
        EXISTS (SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' AND role = 'Technical Manager/Owner')
      )
    )
  );

CREATE POLICY "Sales reps can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' AND role IN ('Sales Representative', 'Technical Manager/Owner')
    )
  );

-- PAYMENTS
DROP POLICY IF EXISTS "Finance and admin can view all payments" ON payments;
DROP POLICY IF EXISTS "Finance and admin can manage payments" ON payments;

CREATE POLICY "Finance and admin can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' AND role IN ('Finance Officer', 'Technical Manager/Owner')
    )
  );

CREATE POLICY "Finance and admin can manage payments"
  ON payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' AND role IN ('Finance Officer', 'Technical Manager/Owner')
    )
  );

-- INVOICES
DROP POLICY IF EXISTS "Finance and admin can view invoices" ON invoices;
CREATE POLICY "Finance and admin can view invoices"
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' AND role IN ('Finance Officer', 'Technical Manager/Owner')
    )
  );

-- DELIVERIES
DROP POLICY IF EXISTS "Drivers can view own deliveries" ON deliveries;
DROP POLICY IF EXISTS "Drivers can update own deliveries" ON deliveries;
DROP POLICY IF EXISTS "Admins can manage all deliveries" ON deliveries;

CREATE POLICY "Drivers can view own deliveries"
  ON deliveries FOR SELECT
  USING (
    driver_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' AND role = 'Technical Manager/Owner'
    )
  );

CREATE POLICY "Drivers can update own deliveries"
  ON deliveries FOR UPDATE
  USING (driver_id::text = auth.uid()::text)
  WITH CHECK (driver_id::text = auth.uid()::text);

CREATE POLICY "Admins can manage all deliveries"
  ON deliveries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' AND role = 'Technical Manager/Owner'
    )
  );

-- AUDIT LOGS
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' AND role = 'Technical Manager/Owner'
    )
  );
