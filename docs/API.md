# 📚 Documentation API - JOSPIA

## Table des Matières
- [Authentification](#authentification)
- [Inscriptions](#inscriptions)
- [Paiements](#paiements)
- [Reçus](#reçus)
- [Dortoirs](#dortoirs)
- [Sections](#sections)
- [Statistiques](#statistiques)

## Base URL
```
Production: https://api.jospia.com
Development: http://localhost:5000/api
```

## Authentification

Tous les endpoints protégés nécessitent un token JWT dans le header:
```
Authorization: Bearer <token>
```

### POST `/auth/register`
Inscription d'un nouvel utilisateur

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "full_name": "Jean Dupont"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "Jean Dupont",
      "role": "participant"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token"
    }
  }
}
```

### POST `/auth/login`
Connexion utilisateur

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "session": {...}
  }
}
```

### POST `/auth/logout`
Déconnexion (Protégé)

**Response:** `200 OK`

### GET `/auth/me`
Récupérer l'utilisateur actuel (Protégé)

**Response:** `200 OK`

### POST `/auth/forgot-password`
Demander réinitialisation du mot de passe

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### POST `/auth/reset-password`
Réinitialiser le mot de passe

**Request Body:**
```json
{
  "token": "reset_token",
  "new_password": "NewPassword123!"
}
```

---

## Inscriptions

### POST `/inscriptions`
Créer une inscription (Protégé)

**Request Body:**
```json
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "section": "Lycée 2",
  "health_condition": "Aucune",
  "age": 17,
  "residence_location": "Abidjan",
  "contact_phone": "0123456789",
  "guardian_name": "Marie Dupont",
  "guardian_contact": "0987654321",
  "gender": "male"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Inscription created successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "first_name": "Jean",
    "last_name": "Dupont",
    "section": "Lycée 2",
    "ticket_price": 5000,
    "status": "pending",
    ...
  }
}
```

### GET `/inscriptions/:id`
Récupérer une inscription (Protégé)

**Response:** `200 OK`

### PUT `/inscriptions/:id`
Modifier une inscription (Protégé)

### GET `/inscriptions`
Lister toutes les inscriptions (Admin)

**Query Parameters:**
- `page` (number): Numéro de page (défaut: 1)
- `limit` (number): Éléments par page (défaut: 20)
- `section` (string): Filtrer par section
- `status` (string): Filtrer par statut (pending, confirmed, cancelled)
- `gender` (string): Filtrer par genre (male, female)
- `search` (string): Rechercher par nom

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Paiements

### POST `/payments/initiate`
Initier un paiement (Protégé)

**Request Body:**
```json
{
  "inscription_id": "uuid",
  "payment_method": "orange_money"
}
```

**Payment Methods:**
- `orange_money`
- `mtn_money`
- `moov_money`
- `wave`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "payment_id": "uuid",
    "payment_url": "https://cinetpay.com/checkout/...",
    "reference": "JOSPIA-1234567890"
  }
}
```

### POST `/payments/callback`
Callback CinetPay (Webhook)

### GET `/payments/:id`
Récupérer un paiement (Protégé)

### GET `/payments/:id/status`
Vérifier le statut d'un paiement (Protégé)

### GET `/payments`
Lister tous les paiements (Admin)

**Query Parameters:**
- `page`, `limit`
- `status` (pending, success, failed)
- `date_from`, `date_to` (ISO date)

---

## Reçus

### GET `/receipts/:id`
Récupérer un reçu (Protégé)

### GET `/receipts/:id/download`
Télécharger le reçu en PDF (Protégé)

**Response:** PDF File

### POST `/receipts/send-email`
Envoyer le reçu par email (Protégé)

**Request Body:**
```json
{
  "receipt_id": "uuid",
  "email": "user@example.com"
}
```

### GET `/receipts`
Lister tous les reçus (Admin)

---

## Dortoirs

### GET `/dormitories`
Lister tous les dortoirs (Protégé)

**Query Parameters:**
- `gender` (male, female)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Dortoir Hommes A",
      "gender": "male",
      "total_capacity": 50,
      "available_slots": 35
    }
  ]
}
```

### GET `/dormitories/:id/available`
Vérifier les places disponibles (Protégé)

### GET `/dormitories/assignment/:inscription_id`
Récupérer l'assignation d'un participant (Protégé)

### POST `/dormitories` (Admin)
Créer un dortoir

**Request Body:**
```json
{
  "name": "Dortoir Hommes D",
  "gender": "male",
  "total_capacity": 60
}
```

### POST `/dormitories/assign` (Admin)
Assigner un dortoir

**Request Body:**
```json
{
  "inscription_id": "uuid",
  "dormitory_id": "uuid",
  "room_number": "12",
  "bed_number": "A3"
}
```

### PUT `/dormitories/assignment/:id` (Admin)
Modifier une assignation

### DELETE `/dormitories/:id` (Admin)
Supprimer un dortoir

---

## Sections

### GET `/sections`
Lister toutes les sections

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Primaire 1" },
    { "id": 2, "name": "Primaire 2" },
    ...
    { "id": 15, "name": "Professionnels" }
  ]
}
```

---

## Statistiques (Admin)

### GET `/stats/dashboard`
Statistiques du dashboard

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "inscriptions": {
      "total": 250,
      "confirmed": 200,
      "pending": 50
    },
    "payments": {
      "total": 220,
      "successful": 200,
      "failed": 20
    },
    "revenue": {
      "total": 1000000,
      "currency": "FCFA"
    },
    "dormitories": {
      "totalCapacity": 300,
      "occupied": 200,
      "available": 100,
      "occupancyRate": 66.67
    },
    "demographics": {
      "male": 120,
      "female": 80
    },
    "sectionDistribution": {
      "Lycée 2": 45,
      "Université": 30,
      ...
    }
  }
}
```

### GET `/stats/occupancy`
Statistiques d'occupation des dortoirs

### GET `/stats/revenue`
Statistiques de revenus

**Query Parameters:**
- `date_from`, `date_to`

### GET `/stats/export/excel`
Exporter les données en Excel (CSV)

**Response:** CSV File

### GET `/stats/export/pdf`
Exporter le rapport en PDF

**Response:** PDF File

---

## Codes d'Erreur

- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (token invalide)
- `403` - Forbidden (accès refusé)
- `404` - Not Found
- `500` - Internal Server Error

## Format d'Erreur
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## Rate Limiting

- 100 requêtes / 15 minutes par IP
- Rate limit headers dans la réponse:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

## Notes de Sécurité

1. Toujours utiliser HTTPS en production
2. Les tokens JWT expirent après 7 jours
3. Les mots de passe doivent contenir au moins 8 caractères
4. Les données sensibles sont chiffrées
5. CORS configuré pour le domaine frontend uniquement
