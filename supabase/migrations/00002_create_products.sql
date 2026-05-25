CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT UNIQUE NOT NULL,
  generic_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  strength TEXT NOT NULL,
  dosage_form TEXT NOT NULL,
  pack_size TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  country_of_origin TEXT NOT NULL,
  unit_of_measure TEXT NOT NULL,
  category TEXT NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  reorder_quantity INTEGER NOT NULL DEFAULT 10,
  storage_requirements TEXT,
  active_status BOOLEAN DEFAULT true,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view products"
  ON products FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Store managers and admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('Store Manager', 'Technical Manager/Owner')
    )
  );
