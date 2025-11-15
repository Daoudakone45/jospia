-- =============================================
-- Fix: Ajouter une policy INSERT pour la table users
-- =============================================

-- Supprimer l'ancienne policy admin qui cause la récursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Recréer la policy admin sans récursion (utiliser auth.jwt() au lieu de SELECT FROM users)
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR auth.uid() = id
  );

-- Permettre l'insertion lors de l'inscription (pour le backend avec Service Key)
-- Le Service Key bypass normalement les RLS, mais on ajoute cette policy pour être sûr
CREATE POLICY "Allow service role to insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- Alternative: Si vous voulez que seuls les utilisateurs authentifiés puissent créer leur propre compte
-- CREATE POLICY "Users can create own account"
--   ON users FOR INSERT
--   WITH CHECK (auth.uid() = id);
