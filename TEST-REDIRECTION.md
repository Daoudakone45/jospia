# 🧪 Test de la redirection après inscription

## ✅ Ce qui a été corrigé

1. **Route de paiement** : Utilise maintenant `/payment/:inscriptionId` au lieu de query parameter
2. **Structure de réponse** : Le service accède correctement à `response.data.data.id`
3. **Navigation** : Redirection automatique vers `/payment/{id}` après inscription

## 🎯 Comment tester

### Étape 1 : Démarrer les serveurs

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Étape 2 : Créer un compte

1. Ouvrir http://localhost:3000/register
2. Remplir le formulaire :
   - Nom complet : Test User
   - Email : test@example.com
   - Mot de passe : Test123456!
3. Cliquer "S'inscrire"

### Étape 3 : Faire une inscription

1. Vous êtes automatiquement redirigé vers /inscription
2. **Étape 1** - Infos personnelles :
   - Prénom : Test
   - Nom : User
   - Âge : 25
   - Lieu de résidence : Abidjan
   - Téléphone : +2250102030405
   - Genre : Masculin
   - Cliquer "Suivant"

3. **Étape 2** - Section :
   - Section : Lyma
   - Problème de santé : Non
   - Cliquer "Suivant"

4. **Étape 3** - Tuteur (optionnel) :
   - Laisser vide ou remplir si mineur
   - Cliquer "Suivant"

5. **Étape 4** - Récapitulatif :
   - Vérifier les informations
   - ✅ **Cliquer "Confirmer et payer"**

### Étape 4 : Vérifier la redirection

**Résultat attendu** :
- ✅ Toast : "Inscription créée avec succès !"
- ✅ Redirection automatique vers `/payment/{inscription-id}`
- ✅ Page de paiement affiche :
  - Récapitulatif de l'inscription
  - Nom du participant
  - Section
  - Montant : 5000 FCFA
  - 4 méthodes de paiement

### Étape 5 : Tester le paiement

1. Sélectionner une méthode (ex: Orange Money)
2. Cliquer "💰 Procéder au paiement"
3. Cliquer "🧪 Simuler le paiement (TEST)"
4. Vérifier :
   - ✅ Toast "🎉 Paiement simulé avec succès !"
   - ✅ Toast "✅ Dortoir attribué automatiquement !"
   - ✅ Redirection vers /dashboard
   - ✅ Dortoir affiché dans la carte "Mon Dortoir"

## 🐛 Dépannage

### Problème : "Page not found" après inscription

**Cause** : L'ID d'inscription est incorrect

**Vérification** :
1. Ouvrir la console du navigateur (F12)
2. Onglet "Network"
3. Vérifier la réponse de POST /api/inscriptions
4. Doit contenir : `{ success: true, data: { id: "...", ... } }`

### Problème : Reste sur la page d'inscription

**Cause** : Erreur lors de la création

**Vérification** :
1. Console navigateur (F12)
2. Vérifier les erreurs
3. Vérifier que l'utilisateur est connecté (token dans localStorage)

### Problème : Erreur 401 Unauthorized

**Cause** : Token expiré ou invalide

**Solution** :
1. Se déconnecter
2. Se reconnecter
3. Refaire l'inscription

## 📊 Logs backend attendus

Après avoir cliqué "Confirmer et payer" :

```
📧 [DEV MODE] Email simulé:
   To: test@example.com
   Subject: Confirmation d'inscription
::1 - - [18/Nov/2025:...] "POST /api/inscriptions HTTP/1.1" 201 544
```

## ✅ Critères de succès

- [ ] Toast de succès affiché
- [ ] Redirection automatique vers /payment/{id}
- [ ] URL contient un UUID valide
- [ ] Page de paiement affiche les bonnes informations
- [ ] Aucune erreur dans la console
- [ ] Logs backend sans erreur

---

**Si tout fonctionne, le flux complet est opérationnel !** 🎉
