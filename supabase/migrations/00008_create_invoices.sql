CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID NOT NULL REFERENCES sales_orders(id),
  invoice_date DATE DEFAULT CURRENT_DATE,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finance and admin can view invoices"
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Finance Officer', 'Technical Manager/Owner')
    )
  );

CREATE POLICY "System can create invoices"
  ON invoices FOR INSERT
  WITH CHECK (true);
