const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkAdmin() {
  console.log('🔍 Checking admin user...\n');
  
  // Check in users table
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'admin@jospia.com');
  
  console.log('📊 Users table:');
  if (usersError) {
    console.error('❌ Error:', usersError.message);
  } else if (usersData.length === 0) {
    console.log('❌ No user found in users table');
  } else {
    console.log('✅ User found:');
    console.log(JSON.stringify(usersData, null, 2));
  }
  
  console.log('\n🔐 Auth users:');
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('❌ Error:', authError.message);
  } else {
    const adminAuth = authData.users.find(u => u.email === 'admin@jospia.com');
    if (adminAuth) {
      console.log('✅ User found in Auth:');
      console.log('   ID:', adminAuth.id);
      console.log('   Email:', adminAuth.email);
      console.log('   Confirmed:', adminAuth.email_confirmed_at ? 'Yes' : 'No');
    } else {
      console.log('❌ No user found in Auth');
    }
  }
}

checkAdmin().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
