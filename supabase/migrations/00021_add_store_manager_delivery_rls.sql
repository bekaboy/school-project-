-- Add Store Manager role to delivery management policies
-- Store Managers need to view and manage deliveries

-- Drop and recreate the "Drivers can view own deliveries" SELECT policy to include Store Manager
DROP POLICY IF EXISTS "Drivers can view own deliveries" ON deliveries;
CREATE POLICY "Staff can view deliveries"
  ON deliveries FOR SELECT
  USING (
    driver_id::text = auth.uid()::text OR
    auth.jwt() -> 'user_metadata' ->> 'role' IN ('Store Manager', 'Technical Manager/Owner')
  );

-- Drop and recreate the admin deliveries ALL policy to include Store Manager
DROP POLICY IF EXISTS "Admins can manage all deliveries" ON deliveries;
CREATE POLICY "Staff can manage deliveries"
  ON deliveries FOR ALL
  USING (auth.jwt() -> 'user_metadata' ->> 'role' IN ('Store Manager', 'Technical Manager/Owner'));
