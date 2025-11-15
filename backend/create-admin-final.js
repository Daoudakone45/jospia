const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const ADMIN_EMAIL = 'admin@jospia.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'Administrateur JOSPIA';

async function createAdmin() {
  try {
    console.log('🔄 Step 1: Creating user in Supabase Auth...\n');

    // Create user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: ADMIN_NAME
      }
    });

    let userId;

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User already exists in Auth. Finding user ID...\n');
        
        // Get all users and find the admin
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          console.error('❌ Error listing users:', listError.message);
          process.exit(1);
        }
        
        const adminUser = users.users.find(u => u.email === ADMIN_EMAIL);
        
        if (!adminUser) {
          console.error('❌ Could not find admin user');
          process.exit(1);
        }
        
        userId = adminUser.id;
        console.log('✅ Found user ID:', userId);
      } else {
        console.error('❌ Auth error:', authError.message);
        process.exit(1);
      }
    } else {
      userId = authData.user.id;
      console.log('✅ User created in Auth!');
      console.log('User ID:', userId);
    }

    console.log('\n🔄 Step 2: Adding admin role to users table...\n');

    // Check if user already exists in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingUser) {
      console.log('⚠️  User already exists in users table. Updating role...');
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'admin', full_name: ADMIN_NAME })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Update error:', updateError.message);
        process.exit(1);
      }
      
      console.log('✅ Admin role updated!');
    } else {
      // Insert into users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email: ADMIN_EMAIL,
          full_name: ADMIN_NAME,
          role: 'admin'
        }])
        .select()
        .single();

      if (userError) {
        console.error('❌ Error inserting into users table:', userError.message);
        process.exit(1);
      }

      console.log('✅ Admin role added to users table!');
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log('🎉 Admin user is ready!');
    console.log('═══════════════════════════════════════════════\n');
    console.log('📧 Credentials:');
    console.log('   Email:    ' + ADMIN_EMAIL);
    console.log('   Password: ' + ADMIN_PASSWORD);
    console.log('   Role:     admin\n');
    console.log('🔗 Login at: http://localhost:3000/login\n');

    // Test login
    console.log('🧪 Testing login...\n');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (loginError) {
      console.error('❌ Login test failed:', loginError.message);
      process.exit(1);
    }

    console.log('✅ Login test successful!');
    console.log('Access token generated:', loginData.session.access_token.substring(0, 20) + '...\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

createAdmin();
