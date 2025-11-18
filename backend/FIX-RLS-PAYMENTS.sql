-- 🔧 FIX: Row Level Security pour la table PAYMENTS
-- Ce script corrige l'erreur "new row violates row-level security policy"

-- Option 1: Désactiver complètement RLS sur payments (RECOMMANDÉ pour backend API)
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- OU Option 2: Créer une politique qui autorise les inserts pour les utilisateurs authentifiés
-- (Décommentez si vous préférez garder RLS actif)

/*
-- Activer RLS si ce n'est pas déjà fait
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent créer des paiements pour leurs propres inscriptions
CREATE POLICY "Users can create payments for their own inscriptions"
ON payments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM inscriptions
    WHERE inscriptions.id = payments.inscription_id
    AND inscriptions.user_id = auth.uid()
  )
);

-- Politique: Les utilisateurs peuvent voir leurs propres paiements
CREATE POLICY "Users can view their own payments"
ON payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM inscriptions
    WHERE inscriptions.id = payments.inscription_id
    AND inscriptions.user_id = auth.uid()
  )
);

-- Politique: Les admins peuvent tout voir et tout faire
CREATE POLICY "Admins have full access to payments"
ON payments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
*/
