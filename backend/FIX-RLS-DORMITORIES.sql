-- Vérifier RLS sur dormitory_assignments
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('dormitory_assignments', 'dormitories');

-- Si RLS est activé, le désactiver :
ALTER TABLE dormitory_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE dormitories DISABLE ROW LEVEL SECURITY;

-- Vérifier les assignations existantes
SELECT * FROM dormitory_assignments;

-- Vérifier les dortoirs
SELECT * FROM dormitories;
