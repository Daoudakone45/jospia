-- =============================================
-- Update admin role for existing user
-- =============================================

-- Update the role to admin for admin@jospia.com
UPDATE users 
SET role = 'admin', 
    full_name = 'Administrateur JOSPIA'
WHERE email = 'admin@jospia.com';

-- If the user doesn't exist in users table but exists in auth,
-- you need to insert it manually with the correct UUID from auth.users

-- To find the UUID, go to Authentication > Users in Supabase Dashboard
-- Copy the User UID, then run:

-- INSERT INTO users (id, email, full_name, role)
-- VALUES (
--   'PASTE_USER_UUID_HERE',
--   'admin@jospia.com',
--   'Administrateur JOSPIA',
--   'admin'
-- )
-- ON CONFLICT (id) DO UPDATE
-- SET role = 'admin', full_name = 'Administrateur JOSPIA';

-- Verify the update
SELECT id, email, full_name, role, created_at
FROM users
WHERE email = 'admin@jospia.com';
