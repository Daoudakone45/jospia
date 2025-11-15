# 🔧 JOSPIA Backend

API REST Node.js/Express pour la gestion des séminaires JOSPIA.

## 🚀 Démarrage Rapide

### Installation

```bash
npm install
```

### Configuration

Copier `.env.example` vers `.env` et remplir les variables :

```bash
cp .env.example .env
```

Variables obligatoires :
- `SUPABASE_URL` : URL de votre projet Supabase
- `SUPABASE_ANON_KEY` : Clé anonyme Supabase
- `SUPABASE_SERVICE_KEY` : Clé service Supabase
- `JWT_SECRET` : Secret pour JWT (min 32 caractères)
- `CINETPAY_API_KEY` : Clé API CinetPay
- `CINETPAY_SITE_ID` : ID du site CinetPay

### Démarrer

```bash
# Développement (avec hot reload)
npm run dev

# Production
npm start
```

Le serveur démarrera sur `http://localhost:5000`

## 📚 Structure

```
src/
├── config/           # Configuration (Supabase)
├── controllers/      # Contrôleurs (logique métier)
├── middleware/       # Middleware (auth, errors, rate limit)
├── routes/           # Routes Express
├── utils/            # Utilitaires (validation, email)
└── server.js         # Point d'entrée
```

## 🔗 Endpoints

Voir [Documentation API complète](../docs/API.md)

### Principaux endpoints

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/inscriptions` - Créer une inscription
- `POST /api/payments/initiate` - Initier un paiement
- `GET /api/receipts/:id/download` - Télécharger un reçu
- `GET /api/stats/dashboard` - Stats dashboard (admin)

## 🔐 Authentification

Utilise Supabase Auth avec JWT. Tous les endpoints protégés nécessitent un header :

```
Authorization: Bearer <token>
```

## 📧 Emails

Configuration SMTP requise pour :
- Confirmation d'inscription
- Envoi de reçus
- Réinitialisation de mot de passe

## 💳 Paiements

Intégration CinetPay pour :
- Orange Money
- MTN Money
- Moov Money
- Wave

## 🧪 Tests

```bash
npm test
```

## 📝 Licence

Propriétaire - JOSPIA © 2025
