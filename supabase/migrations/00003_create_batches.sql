CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  manufacturing_date DATE NOT NULL,
  quantity_received INTEGER NOT NULL CHECK (quantity_received > 0),
  quantity_remaining INTEGER NOT NULL CHECK (quantity_remaining >= 0),
  supplier TEXT NOT NULL,
  date_received DATE DEFAULT CURRENT_DATE,
  batch_status TEXT DEFAULT 'Active' CHECK (batch_status IN ('Active', 'Expired', 'Quarantined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (product_id, batch_number)
);

CREATE INDEX idx_batches_product_id ON batches(product_id);
CREATE INDEX idx_batches_expiry_date ON batches(expiry_date);

ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view batches"
  ON batches FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Store managers and admins can manage batches"
  ON batches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('Store Manager', 'Technical Manager/Owner')
    )
  );
