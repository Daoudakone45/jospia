# 🔐 Création du Compte Administrateur JOSPIA

## Problème
Vous ne pouvez pas vous connecter en tant qu'admin car le compte n'existe pas dans Supabase Auth.

---

## ✅ Solution : Créer l'Admin via Supabase Dashboard

### Étape 1 : Aller sur Supabase Dashboard
1. Ouvrez votre navigateur
2. Allez sur : https://supabase.com/dashboard
3. Connectez-vous avec votre compte
4. Sélectionnez votre projet **JOSPIA**

### Étape 2 : Créer le compte dans Authentication
1. Dans le menu de gauche, cliquez sur **"Authentication"**
2. Cliquez sur **"Users"**
3. Cliquez sur le bouton **"Add user"** (ou "Invite user")
4. Remplissez le formulaire :
   - **Email** : `admin@jospia.com`
   - **Password** : `Admin@123456`
   - **Auto Confirm User** : ✅ Cochez cette case
5. Cliquez sur **"Create user"**

### Étape 3 : Copier l'ID utilisateur
1. Une fois créé, cliquez sur l'utilisateur dans la liste
2. Copiez son **User UID** (format : `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Étape 4 : Ajouter le rôle admin dans la table users
1. Dans le menu de gauche, cliquez sur **"Table Editor"**
2. Sélectionnez la table **"users"**
3. Cliquez sur **"Insert row"** (ou "+ Insert")
4. Remplissez les champs :
   - **id** : Collez l'User UID copié à l'étape 3
   - **email** : `admin@jospia.com`
   - **full_name** : `Administrateur JOSPIA`
   - **role** : `admin`
   - Laissez les autres champs vides ou par défaut
5. Cliquez sur **"Save"**

---

## 🎉 Terminé !

Vous pouvez maintenant vous connecter sur l'application avec :

```
Email    : admin@jospia.com
Password : Admin@123456
Role     : admin
```

URL : http://localhost:3000/login

---

## 🔄 Méthode Alternative : Via SQL Editor

Si vous préférez utiliser SQL :

1. Créez d'abord le compte dans **Authentication > Users** (étapes 1-3 ci-dessus)
2. Allez dans **SQL Editor**
3. Exécutez cette requête en remplaçant `USER_ID_ICI` par l'ID copié :

```sql
-- Remplacez USER_ID_ICI par l'UUID de l'utilisateur créé
INSERT INTO users (id, email, full_name, role)
VALUES (
  'USER_ID_ICI',  -- UUID de l'utilisateur créé dans Auth
  'admin@jospia.com',
  'Administrateur JOSPIA',
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin', full_name = 'Administrateur JOSPIA';
```

---

## ⚠️ Vérification

Après création, vérifiez que tout fonctionne :

### 1. Vérifier dans Authentication
- ✅ User existe dans **Authentication > Users**
- ✅ Email confirmé (pas de badge "unconfirmed")

### 2. Vérifier dans la table users
- ✅ Ligne existe dans **Table Editor > users**
- ✅ `role = 'admin'`
- ✅ `id` correspond à l'UUID Auth

### 3. Tester la connexion
1. Allez sur http://localhost:3000/login
2. Entrez :
   - Email : `admin@jospia.com`
   - Password : `Admin@123456`
3. Cliquez sur **"Se connecter"**
4. Vous devriez être redirigé vers le dashboard
5. Dans la navbar, vous devriez voir le lien **"Administration"**

---

## 🐛 Dépannage

### Erreur : "Invalid login credentials"
- ❌ Mauvais mot de passe
- ✅ Vérifiez que vous utilisez : `Admin@123456`
- ✅ Vérifiez qu'il n'y a pas d'espaces

### Erreur : "User not found"
- ❌ L'utilisateur n'existe pas dans la table `users`
- ✅ Refaites l'étape 4 ci-dessus
- ✅ Vérifiez que l'UUID correspond

### Connexion OK mais pas de menu "Administration"
- ❌ Le rôle n'est pas défini comme `admin`
- ✅ Vérifiez dans **Table Editor > users** que `role = 'admin'`
- ✅ Exécutez cette requête SQL :

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@jospia.com';
```

### Le backend ne répond pas
- ❌ Backend pas lancé
- ✅ Lancez le backend :

```bash
cd backend
npm run dev
```

---

## 📝 Notes Importantes

1. **Sécurité** : Changez le mot de passe `Admin@123456` en production
2. **Email** : Utilisez un email réel en production pour les notifications
3. **Rôle** : Seul `admin` donne accès aux pages d'administration
4. **UUID** : L'ID dans `users` DOIT correspondre à l'ID dans Auth

---

## 🎯 Résumé Rapide

```
1. Supabase Dashboard → Authentication → Add user
   Email: admin@jospia.com
   Password: Admin@123456
   
2. Copier l'UUID généré

3. Table Editor → users → Insert row
   id: [UUID copié]
   email: admin@jospia.com
   full_name: Administrateur JOSPIA
   role: admin
   
4. Login sur http://localhost:3000/login
```

**Temps estimé : 2-3 minutes** ⏱️
