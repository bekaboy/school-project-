-- Add missing UPDATE policies for sales_orders and order_items

-- SALES ORDERS: Sales reps can update own orders, admins can update all
DROP POLICY IF EXISTS "Sales reps can update own orders" ON sales_orders;
CREATE POLICY "Sales reps can update own orders"
  ON sales_orders FOR UPDATE
  USING (
    sales_rep_id::text = auth.uid()::text OR
    auth.jwt() -> 'user_metadata' ->> 'role' = 'Technical Manager/Owner'
  )
  WITH CHECK (
    sales_rep_id::text = auth.uid()::text OR
    auth.jwt() -> 'user_metadata' ->> 'role' = 'Technical Manager/Owner'
  );

-- ORDER ITEMS: Allow updating items for own orders or admin
DROP POLICY IF EXISTS "Users can update order items for own orders" ON order_items;
CREATE POLICY "Users can update order items for own orders"
  ON order_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sales_orders WHERE id = order_items.order_id AND (
        sales_rep_id::text = auth.uid()::text OR
        auth.jwt() -> 'user_metadata' ->> 'role' = 'Technical Manager/Owner'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales_orders WHERE id = order_items.order_id AND (
        sales_rep_id::text = auth.uid()::text OR
        auth.jwt() -> 'user_metadata' ->> 'role' = 'Technical Manager/Owner'
      )
    )
  );
