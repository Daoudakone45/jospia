/**
 * Script to create an admin user in Supabase
 * Run with: node scripts/create-admin.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const ADMIN_EMAIL = 'admin@jospia.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'Administrateur JOSPIA';

async function createAdminUser() {
  try {
    console.log('🔄 Creating admin user...\n');

    // Step 1: Create user in Supabase Auth
    console.log('Step 1: Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: ADMIN_NAME
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User already exists in Auth. Updating user table...');
        
        // Get existing user
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const user = existingUser.users.find(u => u.email === ADMIN_EMAIL);
        
        if (user) {
          // Update user in users table
          const { error: updateError } = await supabase
            .from('users')
            .update({ role: 'admin', full_name: ADMIN_NAME })
            .eq('id', user.id);

          if (updateError) {
            console.error('❌ Error updating user table:', updateError.message);
            process.exit(1);
          }

          console.log('✅ Admin user updated successfully!\n');
          printCredentials();
          process.exit(0);
        }
      } else {
        console.error('❌ Error creating auth user:', authError.message);
        process.exit(1);
      }
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Step 2: Insert into users table with admin role
    console.log('\nStep 2: Adding admin role to users table...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
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

    console.log('✅ User record created with admin role\n');

    // Success message
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Admin user created successfully!');
    console.log('═══════════════════════════════════════════════════════\n');
    printCredentials();

    process.exit(0);
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

function printCredentials() {
  console.log('📧 Admin Credentials:');
  console.log('   Email:    ' + ADMIN_EMAIL);
  console.log('   Password: ' + ADMIN_PASSWORD);
  console.log('   Role:     admin\n');
  console.log('🔗 You can now login at: http://localhost:3000/login\n');
}

// Run the script
createAdminUser();
