require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  console.log('🔧 Création du compte administrateur...\n');

  // Données admin
  const adminEmail = 'admin@jospia.com';
  const adminPassword = 'Admin@123456';
  const adminName = 'Administrateur JOSPIA';

  try {
    // 1. Vérifier si l'admin existe déjà dans la table users
    console.log('📋 Vérification de l\'existence du compte...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', adminEmail)
      .single();

    if (existingUser) {
      console.log('⚠️  Un utilisateur existe déjà avec cet email dans la table users');
      console.log('   ID:', existingUser.id);
      console.log('   Email:', existingUser.email);
      console.log('   Role:', existingUser.role);
      
      // Mettre à jour les user_metadata dans Supabase Auth
      console.log('\n🔄 Mise à jour des métadonnées Supabase Auth...');
      const { error: updateMetaError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          user_metadata: {
            full_name: adminName,
            role: 'admin'
          }
        }
      );

      if (updateMetaError) {
        console.warn('⚠️  Erreur mise à jour métadonnées:', updateMetaError.message);
      } else {
        console.log('✅ Métadonnées Auth mises à jour avec le rôle admin');
      }
      
      if (existingUser.role === 'admin') {
        console.log('\n✅ Le compte admin existe déjà avec le bon rôle !');
        console.log('\n📧 Email:', adminEmail);
        console.log('🔑 Mot de passe:', adminPassword);
        console.log('\n💡 IMPORTANT: Déconnectez-vous et reconnectez-vous');
        console.log('   pour que le nouveau JWT contienne le rôle admin !');
        return;
      } else {
        console.log('\n🔄 Mise à jour du rôle en admin dans la table users...');
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', existingUser.id);
        
        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour:', updateError.message);
        } else {
          console.log('✅ Rôle mis à jour en admin !');
          console.log('\n💡 IMPORTANT: Déconnectez-vous et reconnectez-vous !');
        }
        return;
      }
    }

    // 2. Créer l'utilisateur dans Supabase Auth
    console.log('🔐 Création dans Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirmer l'email
      user_metadata: {
        full_name: adminName,
        role: 'admin' // Ajouter le rôle dans les métadonnées JWT
      }
    });

    if (authError) {
      console.error('❌ Erreur Supabase Auth:', authError.message);
      
      // Si l'erreur est "user already exists", essayer de récupérer l'ID
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        console.log('\n⚠️  L\'utilisateur existe déjà dans Supabase Auth');
        console.log('💡 Tentative de récupération de l\'ID utilisateur...');
        
        // Lister les utilisateurs pour trouver celui avec cet email
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error('❌ Impossible de lister les utilisateurs:', listError.message);
          console.log('\n💡 Solution manuelle :');
          console.log('   1. Allez dans Supabase Dashboard > Authentication > Users');
          console.log('   2. Cherchez', adminEmail);
          console.log('   3. Copiez son ID (UUID)');
          console.log('   4. Exécutez ce SQL :');
          console.log(`\n   INSERT INTO users (id, email, full_name, role)`);
          console.log(`   VALUES ('VOTRE_UUID_ICI', '${adminEmail}', '${adminName}', 'admin')`);
          console.log(`   ON CONFLICT (id) DO UPDATE SET role = 'admin';`);
          return;
        }
        
        const existingAuthUser = listData.users.find(u => u.email === adminEmail);
        if (existingAuthUser) {
          console.log('✅ Utilisateur trouvé dans Auth, ID:', existingAuthUser.id);
          
          // Mettre à jour les user_metadata pour inclure le rôle
          console.log('🔄 Mise à jour des métadonnées utilisateur...');
          const { error: updateMetaError } = await supabase.auth.admin.updateUserById(
            existingAuthUser.id,
            {
              user_metadata: {
                full_name: adminName,
                role: 'admin'
              }
            }
          );

          if (updateMetaError) {
            console.warn('⚠️  Erreur mise à jour métadonnées:', updateMetaError.message);
          } else {
            console.log('✅ Métadonnées mises à jour (le rôle sera dans le JWT)');
          }
          
          // Insérer dans la table users avec UPSERT
          console.log('📊 Synchronisation avec la table users...');
          const { data: insertData, error: insertError } = await supabase
            .from('users')
            .upsert({
              id: existingAuthUser.id,
              email: adminEmail,
              full_name: adminName,
              role: 'admin'
            }, {
              onConflict: 'id'
            })
            .select()
            .single();
          
          if (insertError) {
            console.error('❌ Erreur insertion users:', insertError.message);
          } else {
            console.log('✅ Admin synchronisé avec succès !');
            console.log('\n═══════════════════════════════════════');
            console.log('✅ COMPTE ADMINISTRATEUR PRÊT');
            console.log('═══════════════════════════════════════');
            console.log('📧 Email:', adminEmail);
            console.log('🔑 Mot de passe:', adminPassword);
            console.log('👤 Nom:', adminName);
            console.log('🆔 ID:', existingAuthUser.id);
            console.log('═══════════════════════════════════════');
            console.log('\n💡 IMPORTANT: Déconnectez-vous et reconnectez-vous');
            console.log('   pour que le nouveau JWT contienne le rôle admin !');
          }
        } else {
          console.log('❌ Utilisateur non trouvé dans la liste');
        }
        return;
      }
      return;
    }

    console.log('✅ Compte Auth créé, ID:', authData.user.id);

    // 3. Insérer dans la table users
    console.log('📊 Insertion dans la table users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: adminEmail,
        full_name: adminName,
        role: 'admin'
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Erreur insertion users:', userError.message);
      console.log('🧹 Nettoyage: suppression du compte Auth...');
      await supabase.auth.admin.deleteUser(authData.user.id);
      return;
    }

    console.log('✅ Admin créé avec succès !');
    console.log('\n═══════════════════════════════════════');
    console.log('✅ COMPTE ADMINISTRATEUR CRÉÉ');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Mot de passe:', adminPassword);
    console.log('👤 Nom:', adminName);
    console.log('🆔 ID:', userData.id);
    console.log('═══════════════════════════════════════');
    console.log('\n💡 Vous pouvez maintenant vous connecter avec ces identifiants !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createAdmin();
