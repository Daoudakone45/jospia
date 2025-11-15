-- =============================================
-- JOSPIA - Database Indexes
-- For performance optimization
-- =============================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Inscriptions table indexes
CREATE INDEX IF NOT EXISTS idx_inscriptions_user_id ON inscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_inscriptions_status ON inscriptions(status);
CREATE INDEX IF NOT EXISTS idx_inscriptions_section ON inscriptions(section);
CREATE INDEX IF NOT EXISTS idx_inscriptions_gender ON inscriptions(gender);
CREATE INDEX IF NOT EXISTS idx_inscriptions_created_at ON inscriptions(created_at DESC);

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_inscription_id ON payments(inscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_reference_code ON payments(reference_code);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date DESC);

-- Receipts table indexes
CREATE INDEX IF NOT EXISTS idx_receipts_payment_id ON receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts(receipt_number);

-- Dormitories table indexes
CREATE INDEX IF NOT EXISTS idx_dormitories_gender ON dormitories(gender);
CREATE INDEX IF NOT EXISTS idx_dormitories_available_slots ON dormitories(available_slots);

-- Dormitory assignments table indexes
CREATE INDEX IF NOT EXISTS idx_dormitory_assignments_inscription_id ON dormitory_assignments(inscription_id);
CREATE INDEX IF NOT EXISTS idx_dormitory_assignments_dormitory_id ON dormitory_assignments(dormitory_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_inscriptions_user_status ON inscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_inscription_status ON payments(inscription_id, status);

-- Full-text search indexes (for name search)
CREATE INDEX IF NOT EXISTS idx_inscriptions_names ON inscriptions 
  USING gin(to_tsvector('french', first_name || ' ' || last_name));

-- =============================================
-- Performance Statistics
-- =============================================
COMMENT ON INDEX idx_inscriptions_user_id IS 'Fast lookup of inscriptions by user';
COMMENT ON INDEX idx_payments_status IS 'Filter payments by status efficiently';
COMMENT ON INDEX idx_dormitories_available_slots IS 'Quick find of available dormitories';
