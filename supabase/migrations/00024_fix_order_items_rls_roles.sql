-- Fix order_items RLS: add missing roles for SELECT
-- The previous policy only included Sales Representative and Technical Manager/Owner,
-- but Finance Officer, Store Manager, and Delivery Driver also need to view order items.

-- ORDER ITEMS: All staff roles can view order items
DROP POLICY IF EXISTS "Users can view order items for accessible orders" ON order_items;
CREATE POLICY "Staff can view order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sales_orders WHERE id = order_items.order_id AND (
        sales_rep_id::text = auth.uid()::text OR
        auth.jwt() -> 'user_metadata' ->> 'role' IN (
          'Sales Representative',
          'Finance Officer',
          'Store Manager',
          'Delivery Driver',
          'Technical Manager/Owner'
        )
      )
    )
  );

-- ORDER ITEMS: Finance Officer and Store Manager can update (for batch assignment, etc.)
DROP POLICY IF EXISTS "Sales reps can create order items" ON order_items;
CREATE POLICY "Staff can manage order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN (
        'Sales Representative',
        'Finance Officer',
        'Store Manager',
        'Technical Manager/Owner'
      )
    )
  );
