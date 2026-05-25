CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES sales_orders(id),
  driver_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'In Transit', 'Delivered', 'Failed', 'Rescheduled', 'Cancelled')),
  assigned_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  recipient_name TEXT,
  failure_reason TEXT,
  delivery_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own deliveries"
  ON deliveries FOR SELECT
  USING (
    driver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Technical Manager/Owner'
    )
  );

CREATE POLICY "Drivers can update own deliveries"
  ON deliveries FOR UPDATE
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Admins can manage all deliveries"
  ON deliveries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Technical Manager/Owner'
    )
  );
