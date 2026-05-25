-- Seed users (auth users need to be created via Supabase dashboard or API)
-- These are placeholder records that link to auth.users
INSERT INTO users (id, email, full_name, phone, role, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@pharma.com', 'Era Med Admin', '+251911111111', 'Technical Manager/Owner', true),
  ('00000000-0000-0000-0000-000000000002', 'sales@pharma.com', 'Sales Rep One', '+251911111112', 'Sales Representative', true),
  ('00000000-0000-0000-0000-000000000003', 'store@pharma.com', 'Store Manager', '+251911111113', 'Store Manager', true),
  ('00000000-0000-0000-0000-000000000004', 'finance@pharma.com', 'Finance Officer', '+251911111114', 'Finance Officer', true),
  ('00000000-0000-0000-0000-000000000005', 'driver@pharma.com', 'Delivery Driver', '+251911111115', 'Delivery Driver', true);

-- Seed products
INSERT INTO products (id, product_id, generic_name, brand_name, strength, dosage_form, pack_size, manufacturer, country_of_origin, unit_of_measure, category, cost_price, selling_price, tax_rate, reorder_quantity, storage_requirements) VALUES
  ('10000000-0000-0000-0000-000000000001', 'PROD-2026-00001', 'Amoxicillin', 'Amoxil', '500mg', 'Capsule', '100s', 'GSK', 'UK', 'Box', 'Antibiotics', 150.00, 250.00, 15, 20, 'Room Temperature'),
  ('10000000-0000-0000-0000-000000000002', 'PROD-2026-00002', 'Paracetamol', 'Panadol', '500mg', 'Tablet', '100s', 'Haleon', 'UK', 'Box', 'Analgesics', 50.00, 100.00, 15, 30, 'Room Temperature'),
  ('10000000-0000-0000-0000-000000000003', 'PROD-2026-00003', 'Metformin', 'Glucophage', '500mg', 'Tablet', '100s', 'Merck', 'Germany', 'Box', 'Antidiabetics', 80.00, 150.00, 15, 25, 'Room Temperature');

-- Seed batches
INSERT INTO batches (id, product_id, batch_number, expiry_date, manufacturing_date, quantity_received, quantity_remaining, supplier, batch_status) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'AMX-2025-001', '2027-06-15', '2025-01-15', 500, 450, 'PharmaEthio Supply', 'Active'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'PAN-2025-001', '2026-12-31', '2025-03-01', 1000, 800, 'HealthMed Distributor', 'Active'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'MET-2025-001', '2027-09-20', '2025-02-15', 300, 250, 'Global Pharma Imports', 'Active');

-- Seed customers
INSERT INTO customers (id, name, phone, address, tax_id, license_number) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Bole Pharmacy', '+251911222111', 'Bole, Addis Ababa', 'TIN-001', 'LIC-001'),
  ('30000000-0000-0000-0000-000000000002', 'Merkato Clinic', '+251911222222', 'Merkato, Addis Ababa', 'TIN-002', 'LIC-002'),
  ('30000000-0000-0000-0000-000000000003', 'AAU Health Center', '+251911222333', '6 Kilo, Addis Ababa', 'TIN-003', 'LIC-003');
