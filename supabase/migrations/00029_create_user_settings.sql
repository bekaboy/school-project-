CREATE TABLE user_settings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name        TEXT NOT NULL DEFAULT 'Era Med Pharmaceutical Wholesale PLC',
  amharic_name        TEXT NOT NULL DEFAULT 'የኢራ ሜድ ፋርማሲዩቲካል ኅብረት ሥርዓት የጅምላ ሽያጭ ኃላፊነቱ የተወሰነ የግል ማኅበር',
  tax_id              TEXT NOT NULL DEFAULT '1234567890',
  vat_registration    TEXT NOT NULL DEFAULT 'VAT-987654321',
  phone               TEXT NOT NULL DEFAULT '+251 11 123 4567',
  email               TEXT NOT NULL DEFAULT 'info@eramed.com',
  address             TEXT NOT NULL DEFAULT 'Bole Sub-city, Addis Ababa, Ethiopia',
  currency            TEXT NOT NULL DEFAULT 'ETB (Ethiopian Birr)',
  default_tax_rate    TEXT NOT NULL DEFAULT '15',
  low_stock_threshold TEXT NOT NULL DEFAULT 'Per-product reorder quantity',
  expiry_warning_period TEXT NOT NULL DEFAULT '90',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_user_settings_user_id ON user_settings(user_id);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (user_id::text = auth.uid()::text);
