# 🛠️ Commandes Utiles - JOSPIA

## 📦 Installation

### Backend
```powershell
cd backend
npm install
```

### Frontend
```powershell
cd frontend
npm install
```

### Tout installer
```powershell
cd backend ; npm install ; cd ../frontend ; npm install ; cd ..
```

---

## 🚀 Démarrage

### Backend
```powershell
cd backend
npm run dev     # Mode développement (hot reload)
npm start       # Mode production
```

### Frontend
```powershell
cd frontend
npm run dev     # Mode développement (hot reload)
npm run build   # Build pour production
npm run preview # Preview du build
```

### Démarrer les deux (2 terminaux)
```powershell
# Terminal 1
cd backend ; npm run dev

# Terminal 2
cd frontend ; npm run dev
```

---

## 🧪 Tests

### Backend
```powershell
cd backend
npm test              # Lancer tests
npm run test:watch    # Mode watch
npm run test:coverage # Coverage
```

### Frontend
```powershell
cd frontend
npm test
```

---

## 📝 Code Quality

### Backend
```powershell
cd backend
npm run lint          # Vérifier le code
npm run lint:fix      # Corriger automatiquement
npm run format        # Formater avec Prettier
```

### Frontend
```powershell
cd frontend
npm run lint
npm run format
```

---

## 🗄️ Base de Données

### Exécuter les scripts SQL (Supabase)
Dans le SQL Editor de Supabase, exécuter dans l'ordre :
1. `database/01-create-tables.sql`
2. `database/02-create-indexes.sql`
3. `database/03-seed-data.sql`
4. `database/04-rls-policies.sql`

### Backup (via Supabase Dashboard)
- Aller dans Database > Backups
- Créer un backup manuel

---

## 🔑 Configuration

### Créer les fichiers .env
```powershell
# Backend
cd backend
cp .env.example .env
# Éditer .env avec vos valeurs

# Frontend
cd frontend
cp .env.example .env
# Éditer .env avec vos valeurs
```

---

## 📊 Monitoring & Logs

### Backend logs
```powershell
cd backend
npm run dev | Out-File -FilePath logs.txt  # Sauvegarder logs
Get-Content logs.txt -Wait                 # Voir logs en temps réel
```

### Vérifier les ports utilisés
```powershell
# Port 5000 (backend)
netstat -ano | findstr :5000

# Port 3000 (frontend)
netstat -ano | findstr :3000
```

### Tuer un processus sur un port
```powershell
# Trouver le PID
netstat -ano | findstr :5000

# Tuer le processus (remplacer <PID> par le numéro)
taskkill /PID <PID> /F
```

---

## 🔄 Git

### Initialiser Git
```powershell
git init
git add .
git commit -m "Initial commit: JOSPIA project setup"
```

### Créer repository GitHub
```powershell
git remote add origin https://github.com/username/jospia.git
git branch -M main
git push -u origin main
```

### Workflow habituel
```powershell
git status
git add .
git commit -m "Description des changements"
git push
```

### Créer une branche
```powershell
git checkout -b feature/nom-feature
git push -u origin feature/nom-feature
```

---

## 📦 Build & Déploiement

### Build Frontend
```powershell
cd frontend
npm run build
# Les fichiers seront dans frontend/dist/
```

### Tester le build localement
```powershell
cd frontend
npm run preview
# Ouvre sur http://localhost:4173
```

### Déployer sur Vercel (Frontend)
```powershell
# Installer Vercel CLI
npm install -g vercel

cd frontend
vercel          # Deploy preview
vercel --prod   # Deploy production
```

### Déployer sur Railway (Backend)
1. Créer compte sur railway.app
2. Connecter repo GitHub
3. Configurer les variables d'environnement
4. Deploy automatique à chaque push

---

## 🧹 Nettoyage

### Supprimer node_modules
```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules

# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules
```

### Réinstaller proprement
```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install

# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

### Supprimer les fichiers de build
```powershell
# Frontend
cd frontend
Remove-Item -Recurse -Force dist

# Backend (si applicable)
cd backend
Remove-Item -Recurse -Force dist, build
```

---

## 📧 Test Email (Backend)

### Tester l'envoi d'email
```powershell
cd backend
npm run dev
# Puis utiliser Postman ou curl pour tester l'endpoint
```

### Avec PowerShell (curl)
```powershell
$body = @{
    email = "test@example.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/forgot-password" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

---

## 🔍 Debug

### Backend - Vérifier l'API
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:5000/health"

# Test endpoint
Invoke-RestMethod -Uri "http://localhost:5000/api/sections"
```

### Frontend - Vérifier le build
```powershell
cd frontend
npm run build -- --debug
```

### Afficher les variables d'environnement (sans valeurs sensibles)
```powershell
# Backend
cd backend
Get-Content .env | Select-String -Pattern "^[A-Z_]+=" | ForEach-Object { $_.Line.Split('=')[0] }

# Frontend
cd frontend
Get-Content .env | Select-String -Pattern "^VITE_" | ForEach-Object { $_.Line.Split('=')[0] }
```

---

## 📊 Stats du projet

### Compter les lignes de code
```powershell
# Backend
(Get-ChildItem -Path backend/src -Recurse -Include *.js | 
    Get-Content | 
    Measure-Object -Line).Lines

# Frontend
(Get-ChildItem -Path frontend/src -Recurse -Include *.tsx,*.ts | 
    Get-Content | 
    Measure-Object -Line).Lines
```

### Taille du projet
```powershell
# Backend (sans node_modules)
Get-ChildItem -Path backend -Recurse -Exclude node_modules | 
    Measure-Object -Property Length -Sum | 
    Select-Object @{Name="SizeMB";Expression={[math]::Round($_.Sum/1MB,2)}}

# Frontend (sans node_modules)
Get-ChildItem -Path frontend -Recurse -Exclude node_modules | 
    Measure-Object -Property Length -Sum | 
    Select-Object @{Name="SizeMB";Expression={[math]::Round($_.Sum/1MB,2)}}
```

---

## 🔐 Sécurité

### Vérifier les vulnérabilités
```powershell
# Backend
cd backend
npm audit
npm audit fix           # Corriger automatiquement
npm audit fix --force   # Forcer les corrections

# Frontend
cd frontend
npm audit
npm audit fix
```

### Mettre à jour les dépendances
```powershell
# Backend
cd backend
npm outdated            # Voir dépendances obsolètes
npm update              # Mettre à jour (safe)

# Frontend
cd frontend
npm outdated
npm update
```

---

## 📝 Documentation

### Générer la doc API (si vous installez apidoc)
```powershell
cd backend
npm install -g apidoc
apidoc -i src/ -o docs/api/
```

### Ouvrir la documentation
```powershell
# Ouvrir dans le navigateur
start docs/API.md
start docs/INSTALLATION.md
start PROJECT_SUMMARY.md
```

---

## 🎨 Autres commandes utiles

### Ouvrir VSCode dans les dossiers
```powershell
code backend    # Ouvrir backend dans VSCode
code frontend   # Ouvrir frontend dans VSCode
code .          # Ouvrir projet entier
```

### Créer un backup rapide
```powershell
$date = Get-Date -Format "yyyy-MM-dd"
Compress-Archive -Path . -DestinationPath "../jospia-backup-$date.zip" -Force
```

### Vérifier versions Node/npm
```powershell
node --version
npm --version
git --version
```

---

**💡 Astuce** : Ajoutez ces commandes à vos favoris PowerShell ou créez des aliases !
