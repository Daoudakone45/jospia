# 🎓 JOSPIA - Système de Gestion des Séminaires

Application web complète pour la gestion des inscriptions, paiements et hébergement des participants aux séminaires JOSPIA.

## 🚀 Stack Technologique

### Frontend
- **Framework**: React 18+ avec TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **PDF Export**: jsPDF + html2canvas
- **Formulaires**: React Hook Form
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Base de données**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Validation**: Joi
- **Email**: Nodemailer
- **Paiement**: CinetPay

## 📁 Structure du Projet

```
Jospia/
├── backend/           # API Node.js/Express
├── frontend/          # Application React
├── database/          # Scripts SQL Supabase
└── docs/             # Documentation
```

## 🔧 Installation

### Prérequis
- Node.js v18+
- npm ou yarn
- Compte Supabase
- Compte CinetPay (pour les paiements)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm run dev
```

## 🗄️ Base de Données

Les scripts SQL de création des tables se trouvent dans le dossier `database/`.
Exécutez-les dans l'ordre suivant dans votre console Supabase :

1. `01-create-tables.sql`
2. `02-create-indexes.sql`
3. `03-seed-data.sql`

## 🌐 Déploiement

### Frontend (Vercel)
```bash
cd frontend
vercel deploy --prod
```

### Backend (Railway/Render)
Connectez votre repository GitHub et configurez les variables d'environnement.

## 📚 Documentation

- [Documentation API](docs/API.md)
- [Guide Utilisateur](docs/USER_GUIDE.md)
- [Manuel Administrateur](docs/ADMIN_GUIDE.md)
- [Configuration Supabase](docs/SUPABASE_SETUP.md)

## 🔐 Sécurité

- Authentification JWT via Supabase Auth
- CORS configuré pour le domaine frontend uniquement
- Rate limiting sur les endpoints critiques
- Validation des inputs côté backend
- HTTPS obligatoire en production
- Sanitization contre XSS et injection SQL

## 📧 Contact

- Email: sx
- Documentation: https://docs.jospia.com

## 📄 Licence

Propriétaire - JOSPIA © 2025
