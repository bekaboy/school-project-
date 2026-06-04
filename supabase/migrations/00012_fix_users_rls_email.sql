DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' AND role = 'Technical Manager/Owner'
    )
  );
