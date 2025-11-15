-- =============================================
-- JOSPIA - Database Schema
-- Supabase PostgreSQL
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Table: users
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('participant', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: inscriptions
-- =============================================
CREATE TABLE IF NOT EXISTS inscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  section VARCHAR(100) NOT NULL,
  health_condition TEXT,
  age INTEGER NOT NULL CHECK (age >= 13 AND age <= 100),
  residence_location VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  guardian_name VARCHAR(100),
  guardian_contact VARCHAR(20),
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  ticket_price INTEGER DEFAULT 5000,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: payments
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inscription_id UUID NOT NULL REFERENCES inscriptions(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  reference_code VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  payment_date TIMESTAMP WITH TIME ZONE,
  receipt_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: receipts
-- =============================================
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  pdf_url VARCHAR(500),
  qr_code VARCHAR(500),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: dormitories
-- =============================================
CREATE TABLE IF NOT EXISTS dormitories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
  available_slots INTEGER NOT NULL CHECK (available_slots >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: dormitory_assignments
-- =============================================
CREATE TABLE IF NOT EXISTS dormitory_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inscription_id UUID NOT NULL UNIQUE REFERENCES inscriptions(id) ON DELETE CASCADE,
  dormitory_id UUID NOT NULL REFERENCES dormitories(id) ON DELETE CASCADE,
  room_number VARCHAR(50),
  bed_number VARCHAR(50),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Function: Update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- Triggers: Auto-update updated_at
-- =============================================
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inscriptions_updated_at BEFORE UPDATE ON inscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Comments
-- =============================================
COMMENT ON TABLE users IS 'Utilisateurs de l''application (participants et admins)';
COMMENT ON TABLE inscriptions IS 'Inscriptions des participants au séminaire';
COMMENT ON TABLE payments IS 'Paiements effectués par les participants';
COMMENT ON TABLE receipts IS 'Reçus de paiement générés';
COMMENT ON TABLE dormitories IS 'Dortoirs disponibles pour l''hébergement';
COMMENT ON TABLE dormitory_assignments IS 'Affectations des participants aux dortoirs';
