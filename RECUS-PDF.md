# 📄 Génération de Reçus PDF - JOSPIA

## ✅ Ce qui a été implémenté

### Backend

1. **Service PDF (`pdfService.js`)** :
   - ✅ Génération de reçus PDF professionnels avec PDFKit
   - ✅ QR Code pour vérification d'authenticité
   - ✅ Design JOSPIA avec logo et couleurs
   - ✅ Fonction bonus : Génération de badges participants

2. **Route API** :
   - ✅ `GET /api/payments/:id/receipt` - Télécharger le reçu PDF
   - ✅ Vérification que le paiement est réussi
   - ✅ Vérification des permissions (utilisateur ou admin)
   - ✅ Génération automatique du numéro de reçu

### Frontend

1. **Page de reçu (`ReceiptPage.tsx`)** :
   - ✅ Affichage du reçu à l'écran
   - ✅ Bouton "Télécharger PDF"
   - ✅ Bouton "Imprimer"
   - ✅ Design professionnel et imprimable

2. **Intégration tableau de bord** :
   - ✅ Lien "📄 Télécharger le reçu" après paiement réussi
   - ✅ Route `/receipt/:paymentId`

## 🎨 Contenu du Reçu PDF

Le reçu généré contient :

### En-tête
- Logo JOSPIA
- Nom de l'événement
- Dates (20-27 Décembre 2025)
- Lieu (Anyama, Côte d'Ivoire)
- Titre "REÇU DE PAIEMENT"
- Numéro de reçu unique

### Informations de paiement
- ✅ Date et heure du paiement
- ✅ Statut (PAYÉ)
- ✅ Méthode de paiement (Orange, MTN, Moov, Wave)
- ✅ Référence de transaction

### Informations du participant
- ✅ Nom complet
- ✅ Email
- ✅ Téléphone
- ✅ Section
- ✅ Genre

### Montant
- ✅ Montant payé en FCFA (encadré vert)
- ✅ Mention TVA incluse

### QR Code
- ✅ QR Code scannable
- ✅ Contient : numéro reçu, nom, montant, date, référence
- ✅ Pour vérification d'authenticité

### Pied de page
- ✅ Informations JOSPIA
- ✅ Mention "valide sans signature"
- ✅ Date de génération

## 🚀 Comment tester

### 1. Préparer l'environnement

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Créer un paiement

1. Se connecter : http://localhost:3000/login
2. Faire une inscription
3. Aller sur la page de paiement
4. Simuler le paiement

### 3. Accéder au reçu

**Option A - Depuis le tableau de bord** :
1. Aller sur http://localhost:3000/dashboard
2. Dans la carte "Paiement", cliquer "📄 Télécharger le reçu"

**Option B - URL directe** :
- http://localhost:3000/receipt/{payment-id}

### 4. Actions disponibles

- **📄 Télécharger PDF** : Génère et télécharge le PDF professionnel
- **🖨️ Imprimer** : Imprime le reçu depuis le navigateur
- **Copier l'URL** : Partager le lien du reçu

## 📊 Structure du PDF

```
┌─────────────────────────────────────────┐
│  🖼️ LOGO         JOSPIA                │
│                  20-27 Déc 2025         │
│─────────────────────────────────────────│
│                                          │
│      REÇU DE PAIEMENT                   │
│      N° JOSPIA-xxxxx                    │
│                                          │
│  Date: 18 novembre 2025 21:30          │
│  Statut: ✅ PAYÉ                        │
│  Méthode: Orange Money                  │
│  Référence: JOSPIA-17xxxxx              │
│                                          │
│  ─────────────────────────────────────  │
│  PARTICIPANT                             │
│  Nom: Jean Dupont                       │
│  Section: Lyma                          │
│  Téléphone: +225 01 02 03 04 05        │
│                                          │
│  ┌─────────────────────────────────┐   │
│  │  Montant payé:  5,000 FCFA     │   │
│  └─────────────────────────────────┘   │
│                                          │
│         [QR CODE]                       │
│    Scannez pour vérifier                │
│                                          │
│─────────────────────────────────────────│
│  JOSPIA - Document auto-généré          │
│  Valide sans signature                  │
└─────────────────────────────────────────┘
```

## 🔧 Personnalisation

### Ajouter le logo

1. Copier `logo-jospia.png` dans `backend/public/`
2. Le PDF l'inclura automatiquement
3. Si pas de logo, le PDF s'adapte sans

### Modifier le design

Éditer `backend/src/utils/pdfService.js` :

```javascript
// Couleur principale
.fillColor('#2d5016')  // Vert JOSPIA

// Taille du texte
.fontSize(24)

// Position
doc.text('Texte', x, y)
```

## 📱 Bonus : Badges participants

Le service inclut aussi `generateParticipantBadge()` :

```javascript
const { generateParticipantBadge } = require('../utils/pdfService');

const badge = await generateParticipantBadge({
  inscription,
  user,
  dormitory
});

// Badge format 10x15cm avec:
// - Nom du participant
// - Section
// - Dortoir
// - QR code
```

Utilisation future pour l'accueil des participants !

## 🐛 Dépannage

### Erreur : "Cannot find module 'pdfkit'"

```bash
cd backend
npm install pdfkit qrcode
```

### PDF vide ou corrompu

Vérifier que :
1. Le paiement existe et status = 'success'
2. Les données inscription sont complètes
3. Pas d'erreur dans les logs backend

### QR Code ne se génère pas

```bash
npm install qrcode
```

### Logo ne s'affiche pas

1. Copier le logo dans `backend/public/logo-jospia.png`
2. Vérifier le chemin dans `pdfService.js`
3. Le PDF fonctionne sans logo si fichier absent

## 📈 Prochaines améliorations possibles

- [ ] Envoyer le reçu par email (déjà préparé)
- [ ] Personnaliser le nom du fichier
- [ ] Ajouter signature numérique
- [ ] Générer des factures pour les organisations
- [ ] Export en masse pour l'admin
- [ ] Templates de reçus multiples

## ✅ Checklist de test

- [ ] Le reçu s'affiche à l'écran
- [ ] Le bouton "Télécharger PDF" fonctionne
- [ ] Le PDF téléchargé est lisible
- [ ] Le QR code est scannable
- [ ] Les informations sont correctes
- [ ] L'impression fonctionne correctement
- [ ] Le lien depuis le dashboard fonctionne
- [ ] Seuls les paiements réussis ont un reçu

---

**Les reçus PDF sont maintenant opérationnels ! 🎉**
