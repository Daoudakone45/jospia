-- =============================================
-- JOSPIA - Seed Data
-- Initial data for development and testing
-- =============================================

-- =============================================
-- Insert Sample Admin User
-- =============================================
-- Note: In production, create admin via Supabase Auth
-- Password: Admin@123 (hashed with bcrypt)
INSERT INTO users (id, email, password_hash, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@jospia.com', '$2a$10$XqQPq7YqKqJqKqJqKqJqKO', 'Administrateur JOSPIA', 'admin')
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- Insert Sample Dormitories
-- =============================================
INSERT INTO dormitories (name, gender, total_capacity, available_slots) VALUES
  ('Dortoir Hommes A', 'male', 50, 50),
  ('Dortoir Hommes B', 'male', 50, 50),
  ('Dortoir Hommes C', 'male', 40, 40),
  ('Dortoir Femmes A', 'female', 50, 50),
  ('Dortoir Femmes B', 'female', 50, 50),
  ('Dortoir Femmes C', 'female', 40, 40)
ON CONFLICT DO NOTHING;

-- =============================================
-- Display Summary
-- =============================================
DO $$
BEGIN
  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Admin email: admin@jospia.com';
  RAISE NOTICE 'Total dormitory capacity: %', (SELECT SUM(total_capacity) FROM dormitories);
END $$;
