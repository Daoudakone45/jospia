# 🎨 JOSPIA Frontend

Application React TypeScript pour la gestion des inscriptions aux séminaires JOSPIA.

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
- `VITE_API_URL` : URL de l'API backend
- `VITE_SUPABASE_URL` : URL Supabase
- `VITE_SUPABASE_ANON_KEY` : Clé anonyme Supabase

### Démarrer

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview production
npm run preview
```

L'application démarrera sur `http://localhost:3000`

## 📚 Structure

```
src/
├── components/       # Composants réutilisables
├── pages/           # Pages de l'application
│   ├── admin/       # Pages admin
│   └── ...          # Pages publiques/protégées
├── lib/             # Configuration (API, Supabase)
├── store/           # State management (Zustand)
├── services/        # Services API
├── types/           # Types TypeScript
├── App.tsx          # Composant principal
└── main.tsx         # Point d'entrée
```

## 🎯 Fonctionnalités

### Pages Publiques
- Page d'accueil
- Inscription utilisateur
- Connexion

### Pages Participan
- Dashboard personnel
- Formulaire d'inscription multi-étapes
- Paiement en ligne
- Téléchargement de reçu
- Informations de dortoir

### Pages Admin
- Dashboard statistiques
- Gestion des inscrits
- Suivi des paiements
- Gestion des dortoirs
- Exports Excel/PDF

## 🎨 Design

- **Framework CSS** : Tailwind CSS
- **Composants** : Custom components
- **Icons** : À définir
- **Responsive** : Mobile-first

## 🔐 Authentification

Utilise Supabase Auth avec sessions persistantes.

## 📝 State Management

Zustand pour la gestion de l'état global (authentification principalement).

## 🧪 Tests

```bash
npm test
```

## 📝 Licence

Propriétaire - JOSPIA © 2025
