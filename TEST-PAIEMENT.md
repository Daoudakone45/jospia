# Guide de test - Page de paiement JOSPIA

## 🎯 Flux de paiement complet

### Étape 1 : Connexion
1. Ouvrir http://localhost:3000/login
2. Se connecter avec un compte utilisateur

### Étape 2 : Créer une inscription
1. Aller sur http://localhost:3000/inscription
2. Remplir le formulaire en 4 étapes
3. Valider l'inscription

### Étape 3 : Accéder au tableau de bord
1. Aller sur http://localhost:3000/dashboard
2. Vérifier que la carte "Paiement" affiche "Effectuez votre paiement"
3. Cliquer sur "Payer →"

### Étape 4 : Page de paiement
1. URL : http://localhost:3000/payment/{inscription_id}
2. Vérifier l'affichage :
   - ✅ Récapitulatif (nom, section, montant)
   - ✅ 4 méthodes de paiement (Orange, MTN, Moov, Wave)
   - ✅ Bouton "Procéder au paiement"

### Étape 5 : Initier le paiement
1. Sélectionner une méthode (ex: Orange Money)
2. Cliquer sur "💰 Procéder au paiement"
3. Vérifier l'affichage :
   - ✅ Message "Paiement initié !"
   - ✅ Référence de paiement
   - ✅ Instructions de paiement
   - ✅ Bouton "🧪 Simuler le paiement (TEST)"

### Étape 6 : Simuler le paiement
1. Cliquer sur "🧪 Simuler le paiement (TEST)"
2. Vérifier les notifications :
   - ✅ Toast "🎉 Paiement simulé avec succès !"
   - ✅ Toast "✅ Dortoir attribué automatiquement !"
3. Redirection automatique vers /dashboard

### Étape 7 : Vérification finale
1. Sur le tableau de bord, vérifier :
   - ✅ Carte "Paiement" : "✓ Validé"
   - ✅ Carte "Mon Dortoir" : Nom du dortoir assigné
2. Aller sur http://localhost:3000/admin/assignments
3. Vérifier que l'assignation apparaît dans la liste

## 🔧 Endpoints backend utilisés

- POST /api/payments/initiate
- POST /api/payments/{id}/simulate
- GET /api/inscriptions/{id}
- GET /api/inscriptions/my-inscription

## ✅ Points à vérifier

1. **Sécurité** :
   - ✓ Authentification requise
   - ✓ Utilisateur ne peut payer que sa propre inscription
   - ✓ Pas de double paiement

2. **Fonctionnalités** :
   - ✓ Sélection méthode de paiement
   - ✓ Création du paiement en base
   - ✓ Simulation du paiement
   - ✓ Attribution automatique du dortoir
   - ✓ Mise à jour du statut inscription

3. **UX** :
   - ✓ Messages clairs et en français
   - ✓ Loading states
   - ✓ Gestion des erreurs
   - ✓ Redirections appropriées

## 🐛 Debugging

Si problème, vérifier :
1. Backend démarré : `cd backend && npm run dev`
2. Frontend démarré : `cd frontend && npm run dev`
3. Console navigateur (F12) pour les erreurs
4. Logs backend dans le terminal
5. Base de données Supabase accessible
