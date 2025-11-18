# 📧 Configuration Email - JOSPIA

## 🔧 Mode Développement (Actuel)

Les emails sont **désactivés** en mode développement pour éviter les erreurs. Les logs apparaissent dans la console :

```
📧 [DEV MODE] Email simulé:
   To: user@example.com
   Subject: Confirmation d'inscription
```

## 🚀 Configuration pour Production

### Option 1 : Gmail avec App Password (Recommandé)

#### Étapes :

1. **Activer la validation en 2 étapes sur votre compte Gmail** :
   - Aller sur https://myaccount.google.com/security
   - Section "Connexion à Google"
   - Activer "Validation en deux étapes"

2. **Créer un mot de passe d'application** :
   - Aller sur https://myaccount.google.com/apppasswords
   - Sélectionner "Autre (nom personnalisé)"
   - Nom : "JOSPIA Backend"
   - Cliquer "Générer"
   - **Copier le mot de passe généré** (16 caractères sans espaces)

3. **Mettre à jour `.env`** :
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=votre-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  # App Password généré
   EMAIL_FROM=noreply@jospia.com
   ```

4. **Activer les emails en production** :
   ```env
   NODE_ENV=production
   ```

### Option 2 : SendGrid (Alternative recommandée)

SendGrid offre 100 emails/jour gratuits et est plus fiable pour la production.

#### Étapes :

1. **Créer un compte SendGrid** :
   - Aller sur https://sendgrid.com
   - S'inscrire gratuitement

2. **Générer une API Key** :
   - Dashboard → Settings → API Keys
   - Créer une nouvelle clé avec accès "Full Access"
   - **Copier la clé** (elle ne sera affichée qu'une fois)

3. **Installer le package** :
   ```bash
   npm install @sendgrid/mail
   ```

4. **Mettre à jour `.env`** :
   ```env
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=noreply@jospia.com
   ```

5. **Modifier `emailService.js`** :
   ```javascript
   const sgMail = require('@sendgrid/mail');
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
   
   const sendEmail = async ({ to, subject, html }) => {
     const msg = { to, from: process.env.EMAIL_FROM, subject, html };
     await sgMail.send(msg);
   };
   ```

### Option 3 : Mailgun

Similaire à SendGrid, 5000 emails/mois gratuits.

1. **Créer un compte** : https://www.mailgun.com
2. **Obtenir les credentials** : Dashboard → Domains
3. **Configuration** :
   ```env
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=postmaster@your-domain.mailgun.org
   SMTP_PASS=your-mailgun-password
   ```

## 🧪 Tester l'envoi d'emails

### En développement (mode actuel) :
Les emails sont simulés, rien à faire.

### En production :

```javascript
// Test simple dans Node.js console
const emailService = require('./src/utils/emailService');

emailService.sendEmail({
  to: 'test@example.com',
  subject: 'Test JOSPIA',
  html: '<h1>Test email</h1><p>Ceci est un test.</p>'
}).then(result => {
  console.log('Résultat:', result);
}).catch(err => {
  console.error('Erreur:', err);
});
```

## 📝 Types d'emails envoyés par JOSPIA

1. **Email de confirmation d'inscription** :
   - Envoyé après création du compte
   - Contient les détails de l'inscription

2. **Email de confirmation de paiement** :
   - Envoyé après paiement réussi
   - Inclut le reçu en pièce jointe (PDF)

3. **Email d'assignation dortoir** :
   - Envoyé après attribution du dortoir
   - Contient le nom du dortoir et les instructions

## ⚠️ Erreurs communes

### "Invalid login: 535 Username and Password not accepted"
- **Cause** : Mot de passe incorrect ou authentification 2FA non configurée
- **Solution** : Utiliser un App Password (voir Option 1 ci-dessus)

### "Error: self signed certificate in certificate chain"
- **Cause** : Problème SSL
- **Solution** : Ajouter `tls: { rejectUnauthorized: false }` (DEV uniquement)

### Emails arrivent en spam
- **Cause** : Configuration SPF/DKIM manquante
- **Solution** : Utiliser SendGrid ou configurer SPF/DKIM pour votre domaine

## 🔒 Sécurité

- ✅ **Ne jamais** committer le fichier `.env`
- ✅ Utiliser des App Passwords, pas des mots de passe normaux
- ✅ Limiter les permissions des API keys
- ✅ Utiliser HTTPS en production
- ✅ Valider les adresses email avant envoi

## 📊 Monitoring

En production, monitorer :
- Taux de délivrabilité (> 95%)
- Taux de bounce (< 5%)
- Temps de réponse SMTP
- Quota d'emails restants

## 🎯 Recommandation

Pour JOSPIA en production, je recommande **SendGrid** car :
- ✅ 100 emails/jour gratuits suffisants
- ✅ Interface simple
- ✅ Statistiques détaillées
- ✅ Bonne délivrabilité
- ✅ Support technique

---

**Note** : Pour l'instant, le mode développement fonctionne sans configuration email. Les inscriptions et paiements fonctionnent normalement, seules les notifications par email sont simulées.
