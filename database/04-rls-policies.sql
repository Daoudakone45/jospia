-- =============================================
-- JOSPIA - Row Level Security (RLS) Policies
-- Supabase Security Configuration
-- =============================================

-- =============================================
-- Enable RLS on all tables
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dormitories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dormitory_assignments ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Users Table Policies
-- =============================================

-- Users can view their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- Inscriptions Table Policies
-- =============================================

-- Users can create their own inscriptions
CREATE POLICY "Users can create inscriptions"
  ON inscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own inscriptions
CREATE POLICY "Users can view own inscriptions"
  ON inscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own inscriptions
CREATE POLICY "Users can update own inscriptions"
  ON inscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all inscriptions
CREATE POLICY "Admins can view all inscriptions"
  ON inscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all inscriptions
CREATE POLICY "Admins can update all inscriptions"
  ON inscriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete inscriptions
CREATE POLICY "Admins can delete inscriptions"
  ON inscriptions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- Payments Table Policies
-- =============================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inscriptions
      WHERE inscriptions.id = payments.inscription_id
      AND inscriptions.user_id = auth.uid()
    )
  );

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role can manage payments (for backend)
CREATE POLICY "Service role can manage payments"
  ON payments FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =============================================
-- Receipts Table Policies
-- =============================================

-- Users can view their own receipts
CREATE POLICY "Users can view own receipts"
  ON receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM payments
      JOIN inscriptions ON inscriptions.id = payments.inscription_id
      WHERE payments.id = receipts.payment_id
      AND inscriptions.user_id = auth.uid()
    )
  );

-- Admins can view all receipts
CREATE POLICY "Admins can view all receipts"
  ON receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- Dormitories Table Policies
-- =============================================

-- Everyone can view dormitories
CREATE POLICY "Anyone can view dormitories"
  ON dormitories FOR SELECT
  TO authenticated
  USING (true);

-- Admins can manage dormitories
CREATE POLICY "Admins can manage dormitories"
  ON dormitories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- Dormitory Assignments Table Policies
-- =============================================

-- Users can view their own assignment
CREATE POLICY "Users can view own assignment"
  ON dormitory_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inscriptions
      WHERE inscriptions.id = dormitory_assignments.inscription_id
      AND inscriptions.user_id = auth.uid()
    )
  );

-- Admins can view all assignments
CREATE POLICY "Admins can view all assignments"
  ON dormitory_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage assignments
CREATE POLICY "Admins can manage assignments"
  ON dormitory_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- Notes
-- =============================================
-- These policies ensure:
-- 1. Users can only access their own data
-- 2. Admins have full access to all data
-- 3. Service role (backend) can manage payments
-- 4. Public dormitory information is readable
