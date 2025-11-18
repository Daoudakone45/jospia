-- Vérifier les dortoirs existants
SELECT * FROM dormitories;

-- Si aucun dortoir n'existe, en créer :

-- Dortoirs pour hommes
INSERT INTO dormitories (name, gender, total_capacity, available_slots)
VALUES 
  ('test Homme', 'male', 50, 50);

-- Dortoirs pour femmes
INSERT INTO dormitories (name, gender, total_capacity, available_slots)
VALUES 
  ('test Femme', 'female', 50, 50);

-- Vérifier les assignations existantes
SELECT 
  da.*,
  d.name as dormitory_name,
  i.first_name,
  i.last_name,
  i.gender
FROM dormitory_assignments da
JOIN dormitories d ON da.dormitory_id = d.id
JOIN inscriptions i ON da.inscription_id = i.id
ORDER BY da.created_at DESC;
