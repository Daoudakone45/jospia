# ✅ TEST COMPLET DU SYSTÈME JOSPIA

## 🎯 Objectif
Tester le flux complet : Inscription → Paiement → Assignation Dortoir → PDF

---

## 📋 Étapes de Test

### 1️⃣ Créer un Nouveau Compte

```
URL: http://localhost:3000/register
Email: test@jospia.com
Mot de passe: Test123!
Nom: Test
Prénom: Participant
```

### 2️⃣ Compléter l'Inscription

**Étape 1 - Informations Personnelles:**
- Nom: Test
- Prénom: Participant
- Section: Sainte Monique
- Téléphone: +33612345678
- Âge: 25
- Genre: **male** ou **female** (important pour dortoir!)
- Lieu de résidence: Abidjan

**Étape 2 - Santé:**
- État de santé: Aucun
- Allergies: Non

**Étape 3 - Contact d'Urgence:**
- Nom tuteur: Papa Test
- Contact tuteur: +33698765432

**Étape 4 - Récapitulatif:**
- Vérifier toutes les infos
- ✅ Soumettre

### 3️⃣ Effectuer le Paiement

```
Page de paiement s'affiche automatiquement
```

1. **Sélectionner un mode de paiement:**
   - 🟠 Orange Money
   - 🔵 MTN Money
   - 🟢 Moov Money
   - 🌊 Wave

2. **Cliquer sur "💰 Payer 5000 FCFA"**

3. **Vérifications automatiques:**
   - ✅ Paiement créé avec statut "success"
   - ✅ Inscription changée en "confirmed"
   - ✅ **Dortoir assigné automatiquement** selon le genre
   - ✅ Email de confirmation envoyé (simulé en dev)

### 4️⃣ Vérifier l'Assignation du Dortoir

**Dans le terminal backend, cherchez ces logs:**

```bash
🏠 Attribution automatique de dortoir pour inscription <ID>, genre: male
👤 Participant: Test Participant, Genre: male
✅ Dortoir sélectionné: Dortoir Hommes A (10 places disponibles)
✅ Attribution réussie: {
  participant: 'Test Participant',
  dortoir: 'Dortoir Hommes A',
  places_restantes: 9
}
```

### 5️⃣ Télécharger le Reçu PDF

1. **Retourner au Dashboard** (`/dashboard`)
2. **Cliquer sur l'inscription** confirmée
3. **Cliquer sur "📥 Télécharger le reçu"**

**Le PDF doit contenir:**
- ✅ Logo JOSPIA
- ✅ Informations participant
- ✅ Montant: 5000 FCFA
- ✅ Mode de paiement
- ✅ Référence de paiement
- ✅ **Dortoir assigné** (ex: "Dortoir Hommes A")
- ✅ QR Code
- ✅ Numéro de reçu unique

---

## 🔍 Vérifications dans Supabase

### Table `payments`
```sql
SELECT * FROM payments ORDER BY created_at DESC LIMIT 1;
```

**Doit afficher:**
- status: `success`
- amount: `5000`
- payment_method: `orange_money` (ou autre)
- reference_code: `JOSPIA-xxx`

### Table `inscriptions`
```sql
SELECT * FROM inscriptions ORDER BY created_at DESC LIMIT 1;
```

**Doit afficher:**
- status: `confirmed` ✅

### Table `dormitory_assignments`
```sql
SELECT 
  da.*,
  d.name as dormitory_name,
  i.first_name,
  i.last_name,
  i.gender
FROM dormitory_assignments da
JOIN dormitories d ON da.dormitory_id = d.id
JOIN inscriptions i ON da.inscription_id = i.id
ORDER BY da.created_at DESC
LIMIT 1;
```

**Doit afficher:**
- inscription_id: ID de votre inscription
- dormitory_id: ID d'un dortoir
- dormitory_name: Nom du dortoir assigné
- **Le genre du dortoir doit correspondre au genre du participant !**

### Table `dormitories`
```sql
SELECT * FROM dormitories;
```

**Vérifiez que `available_slots` a bien diminué de 1** pour le dortoir assigné

---

## ❌ Problèmes Possibles

### Erreur: "new row violates row-level security policy for table payments"
**Solution:** Désactiver RLS sur la table `payments`
```sql
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
```

### Erreur: "Aucun dortoir disponible"
**Solution:** Créer des dortoirs dans Supabase
```sql
-- Créer dortoir hommes
INSERT INTO dormitories (name, gender, total_capacity, available_slots)
VALUES ('Dortoir Hommes A', 'male', 20, 20);

-- Créer dortoir femmes
INSERT INTO dormitories (name, gender, total_capacity, available_slots)
VALUES ('Dortoir Femmes A', 'female', 20, 20);
```

### Erreur: "dormitoryService.assignDormitory is not a function"
**Solution:** Redémarrer le serveur backend
```bash
Ctrl+C
npm run dev
```

### Le dortoir n'est pas assigné
**Vérifiez dans les logs backend:**
- ✅ Le paiement a bien été créé ?
- ✅ L'appel à `assignDormitory` a été fait ?
- ✅ Y a-t-il des dortoirs disponibles pour ce genre ?

---

## 🎉 Résultat Attendu

Après toutes ces étapes, vous devriez avoir :

1. ✅ **Compte créé** avec email/mot de passe
2. ✅ **Inscription complète** avec statut `confirmed`
3. ✅ **Paiement enregistré** avec statut `success`
4. ✅ **Dortoir assigné automatiquement** selon le genre
5. ✅ **Email envoyé** (simulé en mode dev)
6. ✅ **PDF téléchargeable** avec toutes les infos + dortoir

---

## 📊 Test Admin

### Connexion Admin
```
Email: admin@jospia.com
Mot de passe: votre_mot_de_passe_admin
```

### Vérifier les Stats
1. Aller sur `/admin/stats`
2. **Vérifier:**
   - Total inscriptions: +1
   - Paiements confirmés: +1
   - Total revenus: +5000 FCFA
   - Occupation dortoirs mise à jour

### Télécharger Excel
1. Cliquer sur "📊 Exporter vers Excel"
2. **Le fichier Excel doit contenir:**
   - Sheet 1: Liste des participants avec dortoir assigné
   - Sheet 2: Statistiques globales

---

## 🔧 Commandes Utiles

### Redémarrer Backend
```bash
cd backend
npm run dev
```

### Redémarrer Frontend
```bash
cd frontend
npm run dev
```

### Voir les logs en temps réel
```bash
# Terminal backend déjà ouvert
# Regardez les emojis: 🏠 pour dortoirs, 💰 pour paiements
```

### Nettoyer la base de données (ATTENTION!)
```sql
-- Supprimer toutes les assignations
DELETE FROM dormitory_assignments;

-- Réinitialiser les places disponibles
UPDATE dormitories SET available_slots = total_capacity;

-- Supprimer les paiements de test
DELETE FROM payments WHERE reference_code LIKE 'JOSPIA-17%';

-- Supprimer les inscriptions de test
DELETE FROM inscriptions WHERE email LIKE 'test%';
```

---

## 🐛 Debug

Si quelque chose ne fonctionne pas, cherchez dans les logs backend :

- 📝 `createSimplePayment - Body:` → Données envoyées
- 👤 `User:` → Utilisateur authentifié
- 📋 `Inscription:` → Données de l'inscription
- 💰 `Paiement créé:` → Paiement en base de données
- 🏠 `Attribution automatique de dortoir` → Assignation dortoir
- ✅ `Dortoir attribué:` → Succès
- ❌ `Erreur` → Problème détaillé

---

**Bonne chance ! 🚀**
