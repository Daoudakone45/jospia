# 🚨 FIX: Authentification Admin JOSPIA

## Problème
L'authentification ne fonctionne pas car le compte admin n'existe pas correctement dans la base de données.

---

## ✅ Solution Rapide (3 étapes - 2 minutes)

### 1️⃣ Créer l'utilisateur dans Authentication

1. Ouvrez votre navigateur → https://supabase.com/dashboard
2. Sélectionnez le projet **JOSPIA**
3. Menu gauche → **Authentication** → **Users**
4. Cliquez **"Add user"** (bouton vert en haut)
5. Remplissez :
   ```
   Email: admin@jospia.com
   Password: Admin@123456
   ```
6. ✅ **IMPORTANT**: Cochez **"Auto Confirm User"**
7. Cliquez **"Create user"**

### 2️⃣ Copier l'UUID

1. L'utilisateur apparaît dans la liste
2. Cliquez sur `admin@jospia.com`
3. En haut, vous voyez **"User UID"**
4. **COPIEZ** cet UUID (format: `a1b2c3d4-e5f6-7890-abcd-1234567890ab`)

### 3️⃣ Ajouter le rôle admin

1. Menu gauche → **SQL Editor**
2. Cliquez **"New query"**
3. Collez ce code en **remplaçant** `COLLEZ_UUID_ICI` par l'UUID que vous avez copié:

```sql
INSERT INTO users (id, email, full_name, role)
VALUES (
  'COLLEZ_UUID_ICI',  -- ⬅️ Collez l'UUID ici entre les guillemets
  'admin@jospia.com',
  'Administrateur JOSPIA',
  'admin'
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin', 
  full_name = 'Administrateur JOSPIA';
```

4. Cliquez **"Run"** (ou Ctrl+Enter)
5. Vous devriez voir: ✅ **Success. No rows returned**

---

## 🧪 Vérification

Exécutez cette requête pour vérifier:

```sql
SELECT id, email, full_name, role 
FROM users 
WHERE email = 'admin@jospia.com';
```

Vous devriez voir:
```
id: [l'UUID]
email: admin@jospia.com
full_name: Administrateur JOSPIA
role: admin  ⬅️ IMPORTANT
```

---

## 🎉 Connexion

1. Allez sur: http://localhost:3000/login
2. Connectez-vous avec:
   ```
   Email: admin@jospia.com
   Password: Admin@123456
   ```
3. Vous devriez être redirigé vers le dashboard
4. Dans la navbar, vous verrez le lien **"Administration"**

---

## ⚠️ Exemple Concret

Imaginons que l'UUID copié soit: `a1b2c3d4-e5f6-7890-abcd-1234567890ab`

Votre requête SQL serait:

```sql
INSERT INTO users (id, email, full_name, role)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  'admin@jospia.com',
  'Administrateur JOSPIA',
  'admin'
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin', 
  full_name = 'Administrateur JOSPIA';
```

---

## 🐛 Si ça ne marche toujours pas

### Erreur: "User not found" après connexion

Vérifiez que l'UUID dans `users` correspond à celui dans `auth.users`:

```sql
-- UUID dans la table users
SELECT id FROM users WHERE email = 'admin@jospia.com';

-- UUID dans auth (via Supabase Dashboard > Authentication > Users)
-- ILS DOIVENT ÊTRE IDENTIQUES
```

### Erreur: "Invalid login credentials"

- Vérifiez le mot de passe: `Admin@123456` (avec majuscule A et @)
- Vérifiez que l'email est confirmé (pas de badge "unconfirmed")
- Si non confirmé, dans Authentication > Users, cliquez sur l'utilisateur → "Send magic link" ou supprimez et recréez avec "Auto Confirm"

---

**⏱️ Temps total: 2-3 minutes**
