# 🚀 Guide d'Installation - JOSPIA

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v9+ (inclus avec Node.js)
- **Git** ([Download](https://git-scm.com/))
- Compte **Supabase** ([Sign up](https://supabase.com/))
- Compte **CinetPay** ([Sign up](https://cinetpay.com/))
- Éditeur de code (VS Code recommandé)

## 📥 Étape 1 : Cloner le Projet

```bash
cd Jospia
```

## 🗄️ Étape 2 : Configuration Supabase

### 2.1 Créer un Projet Supabase

1. Aller sur [supabase.com](https://supabase.com/)
2. Créer un nouveau projet
3. Noter l'URL et les clés API

### 2.2 Exécuter les Scripts SQL

Dans le SQL Editor de Supabase, exécuter dans l'ordre :

```sql
-- 1. Créer les tables
-- Copier/coller le contenu de database/01-create-tables.sql

-- 2. Créer les index
-- Copier/coller le contenu de database/02-create-indexes.sql

-- 3. Insérer les données de test
-- Copier/coller le contenu de database/03-seed-data.sql

-- 4. Configurer les politiques RLS
-- Copier/coller le contenu de database/04-rls-policies.sql
```

### 2.3 Créer un Compte Admin

Dans Supabase Authentication :
1. Aller dans "Authentication" > "Users"
2. Créer un nouvel utilisateur
3. Email: `admin@jospia.com`
4. Mot de passe: Choisir un mot de passe sécurisé
5. Dans la table `users`, mettre `role = 'admin'` pour cet utilisateur

## 🔧 Étape 3 : Configuration Backend

### 3.1 Installer les Dépendances

```bash
cd backend
npm install
```

### 3.2 Configuration des Variables d'Environnement

Copier le fichier d'exemple :
```bash
cp .env.example .env
```

Éditer `.env` avec vos propres valeurs :

```env
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d

# CinetPay
CINETPAY_API_KEY=your_cinetpay_api_key
CINETPAY_SITE_ID=your_site_id
CINETPAY_SECRET_KEY=your_secret_key
CINETPAY_NOTIFY_URL=http://localhost:5000/api/payments/callback
CINETPAY_RETURN_URL=http://localhost:3000/payment/success

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
EMAIL_FROM=noreply@jospia.com

# Application
TICKET_PRICE=5000
CURRENCY=XOF
RECEIPT_PREFIX=JOSPIA-REC-

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3.3 Configurer Gmail pour l'Envoi d'Emails (Optionnel)

1. Aller dans votre compte Google
2. Activer la validation en 2 étapes
3. Générer un mot de passe d'application
4. Utiliser ce mot de passe dans `SMTP_PASS`

### 3.4 Démarrer le Serveur Backend

```bash
# Mode développement (avec hot reload)
npm run dev

# Mode production
npm start
```

Le serveur devrait démarrer sur `http://localhost:5000`

### 3.5 Tester l'API

```bash
# Tester le health check
curl http://localhost:5000/health

# Devrait retourner:
# {"status":"OK","timestamp":"...","uptime":...}
```

## 🎨 Étape 4 : Configuration Frontend

### 4.1 Installer les Dépendances

```bash
cd ../frontend
npm install
```

### 4.2 Configuration des Variables d'Environnement

Copier le fichier d'exemple :
```bash
cp .env.example .env
```

Éditer `.env` :

```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_NAME=JOSPIA
VITE_APP_URL=http://localhost:3000
```

### 4.3 Démarrer le Frontend

```bash
# Mode développement
npm run dev

# L'application sera accessible sur http://localhost:3000
```

### 4.4 Build pour Production

```bash
npm run build

# Les fichiers de production seront dans le dossier 'dist'
```

## ✅ Étape 5 : Vérification de l'Installation

### Backend
- [ ] Le serveur démarre sans erreur
- [ ] `http://localhost:5000/health` retourne OK
- [ ] Les tables Supabase sont créées
- [ ] Le compte admin existe

### Frontend
- [ ] L'application se charge sur `http://localhost:3000`
- [ ] Pas d'erreur dans la console
- [ ] La page d'accueil s'affiche correctement

### Authentification
- [ ] Création de compte fonctionne
- [ ] Connexion fonctionne
- [ ] Déconnexion fonctionne
- [ ] Connexion admin fonctionne

## 🧪 Étape 6 : Tests

### Créer un Participant de Test

1. Aller sur `http://localhost:3000/register`
2. Créer un compte
3. Se connecter
4. Créer une inscription
5. Vérifier que l'email de confirmation est reçu

### Tester le Paiement (Mode Test)

Pour tester les paiements sans argent réel, utiliser les identifiants de test CinetPay fournis dans leur documentation.

## 🚨 Résolution des Problèmes

### Erreur : "Cannot connect to database"
- Vérifier que les credentials Supabase sont corrects
- Vérifier que le projet Supabase est actif
- Vérifier la connexion Internet

### Erreur : "Port already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Erreur : "Module not found"
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Les Emails ne Sont pas Envoyés
- Vérifier les credentials SMTP
- Vérifier que le pare-feu autorise le port 587
- Essayer avec un autre service (SendGrid, Mailgun)

### Erreur CORS
- Vérifier que `FRONTEND_URL` est correct dans backend `.env`
- Vérifier que le backend est bien démarré

## 📚 Prochaines Étapes

1. Lire la [Documentation API](API.md)
2. Consulter le [Guide Utilisateur](USER_GUIDE.md)
3. Consulter le [Manuel Administrateur](ADMIN_GUIDE.md)
4. Configurer le déploiement en production

## 🆘 Support

Pour toute question :
- Email : support@jospia.com
- GitHub Issues : [Créer une issue](https://github.com/jospia/jospia/issues)

## 📝 Notes Importantes

### Sécurité
- **NE JAMAIS** commiter le fichier `.env`
- Changer tous les secrets en production
- Utiliser des mots de passe forts
- Activer HTTPS en production

### Performance
- En production, utiliser un service de cache (Redis)
- Optimiser les images
- Activer la compression gzip
- Utiliser un CDN pour les assets statiques

### Sauvegarde
- Sauvegarder régulièrement la base de données
- Configurer des backups automatiques sur Supabase
- Garder une copie du code source

---

**Félicitations ! 🎉**

Votre installation JOSPIA est maintenant complète et fonctionnelle !
