-- Sales Representatives need to create customers for their orders.
-- Keep full management (UPDATE/DELETE) restricted to Store Manager / Tech Manager,
-- but allow Sales Reps to INSERT new customers.

DROP POLICY IF EXISTS "Sales reps can insert customers" ON customers;
CREATE POLICY "Sales reps can insert customers"
  ON customers FOR INSERT
  WITH CHECK (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'Sales Representative'
  );

-- Also add a similar policy for products: Sales Reps can view and create,
-- but don't need to update/delete products.
-- Only Store Manager and Tech Manager can manage products (already exists).
