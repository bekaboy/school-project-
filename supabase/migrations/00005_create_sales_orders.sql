CREATE TABLE sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  sales_rep_id UUID NOT NULL REFERENCES users(id),
  order_date DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN (
    'Draft', 'Proforma Generated', 'Pending Payment', 'Verified',
    'Invoice Generated', 'In Transit', 'Delivered', 'Cancelled', 'Failed', 'Rescheduled'
  )),
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  delivery_address TEXT,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX idx_orders_status ON sales_orders(status);

ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sales reps can view own orders"
  ON sales_orders FOR SELECT
  USING (
    sales_rep_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Technical Manager/Owner'
    )
  );

CREATE POLICY "Sales reps can create orders"
  ON sales_orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Sales Representative', 'Technical Manager/Owner')
    )
  );
