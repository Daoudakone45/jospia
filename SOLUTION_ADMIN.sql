-- =============================================
-- SOLUTION: Créer l'Admin Manuellement
-- =============================================

-- ÉTAPE 1: Allez sur Supabase Dashboard > Authentication > Users
-- Cliquez sur "Add user" et créez:
--   Email: admin@jospia.com
--   Password: Admin@123456
--   ✅ Cochez "Auto Confirm User"
-- 
-- COPIEZ L'UUID qui est généré (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

-- ÉTAPE 2: Exécutez cette requête en remplaçant UUID_DE_AUTH par l'UUID copié
-- Dans Supabase Dashboard > SQL Editor

INSERT INTO users (id, email, full_name, role)
VALUES (
  'UUID_DE_AUTH',  -- ⚠️ REMPLACEZ par l'UUID copié de Authentication > Users
  'admin@jospia.com',
  'Administrateur JOSPIA',
  'admin'
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin', 
  full_name = 'Administrateur JOSPIA';

-- ÉTAPE 3: Vérifiez que ça a fonctionné
SELECT id, email, full_name, role 
FROM users 
WHERE email = 'admin@jospia.com';

-- Si vous voyez une ligne avec role = 'admin', c'est bon!
-- Vous pouvez maintenant vous connecter sur http://localhost:3000/login
