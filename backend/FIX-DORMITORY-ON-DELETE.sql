-- =============================================
-- JOSPIA - Fix: Libérer automatiquement les dortoirs lors de la suppression
-- =============================================
-- Ce script crée un trigger qui libère automatiquement une place de dortoir
-- quand une assignation est supprimée (par cascade ou manuellement)
-- =============================================

-- Fonction pour libérer une place de dortoir
CREATE OR REPLACE FUNCTION free_dormitory_slot()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrémenter available_slots du dortoir
  UPDATE dormitories
  SET available_slots = available_slots + 1
  WHERE id = OLD.dormitory_id;
  
  -- Logger l'action
  RAISE NOTICE 'Dortoir % libéré: +1 place disponible', OLD.dormitory_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger sur dormitory_assignments
DROP TRIGGER IF EXISTS free_slot_on_delete ON dormitory_assignments;
CREATE TRIGGER free_slot_on_delete
  BEFORE DELETE ON dormitory_assignments
  FOR EACH ROW
  EXECUTE FUNCTION free_dormitory_slot();

-- Vérifier que le trigger est créé
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'free_slot_on_delete';

-- =============================================
-- Test du trigger
-- =============================================
-- Pour tester, vous pouvez :
-- 1. Vérifier les dortoirs actuels:
SELECT id, name, gender, total_capacity, available_slots 
FROM dormitories;

-- 2. Vérifier les assignations:
SELECT da.id, i.first_name, i.last_name, d.name as dormitory, d.available_slots
FROM dormitory_assignments da
JOIN inscriptions i ON i.id = da.inscription_id
JOIN dormitories d ON d.id = da.dormitory_id;

-- 3. Supprimer une inscription (test):
-- DELETE FROM inscriptions WHERE id = 'INSCRIPTION_ID_A_TESTER';

-- 4. Vérifier que available_slots a augmenté:
SELECT id, name, gender, total_capacity, available_slots 
FROM dormitories;
