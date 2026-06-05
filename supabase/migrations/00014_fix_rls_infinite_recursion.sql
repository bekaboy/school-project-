-- Fix infinite recursion in RLS policies
-- Previous policies used EXISTS(SELECT 1 FROM users WHERE ...) which triggered
-- recursive RLS checks on the users table itself (error 42P17).
-- Instead, read role directly from JWT user_metadata.

-- USERS
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'Technical Manager/Owner');

-- PRODUCTS
DROP POLICY IF EXISTS "Store managers and admins can manage products" ON products;
CREATE POLICY "Store managers and admins can manage products"
  ON products FOR ALL
  USING (auth.jwt() -> 'user_metadata' ->> 'role' IN ('Store Manager', 'Technical Manager/Owner'));

-- BATCHES
DROP POLICY IF EXISTS "Store managers and admins can manage batches" ON batches;
CREATE POLICY "Store managers and admins can manage batches"
  ON batches FOR ALL
  USING (auth.jwt() -> 'user_metadata' ->> 'role' IN ('Store Manager', 'Technical Manager/Owner'));

-- CUSTOMERS
DROP POLICY IF EXISTS "Store managers and admins can manage customers" ON customers;
CREATE POLICY "Store managers and admins can manage customers"
  ON customers FOR ALL
  USING (auth.jwt() -> 'user_metadata' ->> 'role' IN ('Store Manager', 'Technical Manager/Owner'));

-- SALES ORDERS
DROP POLICY IF EXISTS "Sales reps can view own orders" ON sales_orders;
DROP POLICY IF EXISTS "Sales reps can create orders" ON sales_orders;

CREATE POLICY "Sales reps can view own orders"
  ON sales_orders FOR SELECT
  USING (
    sales_rep_id::text = auth.uid()::text OR
    auth.jwt() -> 'user_metadata' ->> 'role' = 'Technical Manager/Owner'
  );

CREATE POLICY "Sales reps can create orders"
  ON sales_orders FOR INSERT
  WITH CHECK (
    auth.jwt() -> 'user_metadata' ->> 'role' IN ('Sales Representative', 'Technical Manager/Owner')
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
        auth.jwt() -> 'user_metadata' ->> 'role' = 'Technical Manager/Owner'
      )
    )
  );

CREATE POLICY "Sales reps can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    auth.jwt() -> 'user_metadata' ->> 'role' IN ('Sales Representative', 'Technical Manager/Owner')
  );

-- PAYMENTS
DROP POLICY IF EXISTS "Finance and admin can view all payments" ON payments;
DROP POLICY IF EXISTS "Finance and admin can manage payments" ON payments;

CREATE POLICY "Finance and admin can view all payments"
  ON payments FOR SELECT
  USING (auth.jwt() -> 'user_metadata' ->> 'role' IN ('Finance Officer', 'Technical Manager/Owner'));

CREATE POLICY "Finance and admin can manage payments"
  ON payments FOR ALL
  USING (auth.jwt() -> 'user_metadata' ->> 'role' IN ('Finance Officer', 'Technical Manager/Owner'));

-- INVOICES
DROP POLICY IF EXISTS "Finance and admin can view invoices" ON invoices;
CREATE POLICY "Finance and admin can view invoices"
  ON invoices FOR SELECT
  USING (auth.jwt() -> 'user_metadata' ->> 'role' IN ('Finance Officer', 'Technical Manager/Owner'));

-- DELIVERIES
DROP POLICY IF EXISTS "Drivers can view own deliveries" ON deliveries;
DROP POLICY IF EXISTS "Drivers can update own deliveries" ON deliveries;
DROP POLICY IF EXISTS "Admins can manage all deliveries" ON deliveries;

CREATE POLICY "Drivers can view own deliveries"
  ON deliveries FOR SELECT
  USING (
    driver_id::text = auth.uid()::text OR
    auth.jwt() -> 'user_metadata' ->> 'role' = 'Technical Manager/Owner'
  );

CREATE POLICY "Drivers can update own deliveries"
  ON deliveries FOR UPDATE
  USING (driver_id::text = auth.uid()::text)
  WITH CHECK (driver_id::text = auth.uid()::text);

CREATE POLICY "Admins can manage all deliveries"
  ON deliveries FOR ALL
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'Technical Manager/Owner');

-- AUDIT LOGS
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'Technical Manager/Owner');
