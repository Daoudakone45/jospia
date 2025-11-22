# 🔧 Fix: Mise à jour automatique des dortoirs lors de la suppression

## 🐛 Problème
Lorsqu'une inscription est supprimée, le dortoir assigné n'est pas automatiquement libéré. Le champ `available_slots` reste inchangé, ce qui empêche de réutiliser la place.

## ✅ Solution (Double Protection)

### 1. **Logique Backend** (Déjà implémentée)
Le contrôleur `deleteInscription` libère maintenant manuellement le dortoir :

```javascript
// 1. Récupérer l'assignation de dortoir
const { data: assignment } = await supabase
  .from('dormitory_assignments')
  .select('id, dormitory_id, dormitories(name)')
  .eq('inscription_id', id)
  .single();

// 2. Libérer le dortoir via le service
if (assignment) {
  await dormitoryService.unassignDormitory(assignment.id);
}

// 3. Supprimer l'inscription (cascade supprime l'assignation)
await supabase.from('inscriptions').delete().eq('id', id);
```

**Flux de suppression :**
1. ✅ Vérifier si dortoir assigné
2. ✅ Libérer le dortoir (`available_slots + 1`)
3. ✅ Supprimer les paiements associés
4. ✅ Supprimer l'inscription (cascade supprime l'assignation)

### 2. **Trigger SQL** (Protection au niveau DB)
Un trigger PostgreSQL libère automatiquement la place :

```sql
CREATE OR REPLACE FUNCTION free_dormitory_slot()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dormitories
  SET available_slots = available_slots + 1
  WHERE id = OLD.dormitory_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER free_slot_on_delete
  BEFORE DELETE ON dormitory_assignments
  FOR EACH ROW
  EXECUTE FUNCTION free_dormitory_slot();
```

**Avantages :**
- Protection au niveau base de données
- Fonctionne même si suppression directe en SQL
- Cohérence garantie

## 🚀 Déploiement

### Étape 1 : Exécuter le trigger SQL
```bash
# Dans Supabase SQL Editor, exécutez :
backend/FIX-DORMITORY-ON-DELETE.sql
```

### Étape 2 : Redémarrer le backend
```bash
cd backend
npm run dev
```

### Étape 3 : Tester
1. Créer une inscription
2. Payer → dortoir assigné automatiquement
3. Noter `available_slots` du dortoir
4. Supprimer l'inscription depuis l'interface admin
5. Vérifier que `available_slots` a augmenté de 1

## 📊 Logs de débogage

Le backend affiche maintenant des logs détaillés :

```
🗑️  SUPPRESSION INSCRIPTION: abc-123-def
   Participant: Jean Dupont
   🏠 Dortoir assigné: test Homme
   🔄 Libération du dortoir...
   ✅ Dortoir libéré avec succès
   💰 Suppression de 1 paiement(s)...
   ✅ Paiements supprimés
   🗑️  Suppression de l'inscription...
✅ SUPPRESSION RÉUSSIE
```

## 🔍 Vérification manuelle

```sql
-- Vérifier les dortoirs
SELECT id, name, gender, total_capacity, available_slots 
FROM dormitories;

-- Vérifier les assignations
SELECT da.id, i.first_name, i.last_name, d.name as dormitory
FROM dormitory_assignments da
JOIN inscriptions i ON i.id = da.inscription_id
JOIN dormitories d ON d.id = da.dormitory_id;

-- Vérifier l'historique après suppression
SELECT 
  COUNT(*) as total_inscriptions,
  (SELECT SUM(total_capacity - available_slots) FROM dormitories) as places_occupees
FROM inscriptions WHERE status = 'confirmed';
```

## ⚠️ Important

**Les deux mécanismes sont complémentaires :**
- **Backend** : Logs + validation métier
- **Trigger SQL** : Sécurité au niveau base de données

En cas de suppression directe en SQL, seul le trigger protège les données.

## 📝 Modifications apportées

### Fichiers modifiés :
1. `backend/src/controllers/inscription.controller.js`
   - Import `dormitoryService`
   - Fonction `deleteInscription` renforcée
   - Logs détaillés

2. `backend/FIX-DORMITORY-ON-DELETE.sql` (NOUVEAU)
   - Trigger automatique

### Fichiers inchangés :
- `dormitoryService.js` - `unassignDormitory()` déjà fonctionnel
- Routes - Aucune modification requise
