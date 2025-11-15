const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function syncAdmin() {
  try {
    console.log('🔄 Synchronizing admin user...\n');
    
    // Get user from Auth
    const { data: authData } = await supabase.auth.admin.listUsers();
    const adminAuth = authData.users.find(u => u.email === 'admin@jospia.com');
    
    if (!adminAuth) {
      console.error('❌ Admin not found in Auth. Please create it first.');
      console.log('\n📝 Go to Supabase Dashboard > Authentication > Users');
      console.log('   Click "Add user" and create:');
      console.log('   Email: admin@jospia.com');
      console.log('   Password: Admin@123456');
      return;
    }
    
    console.log('✅ Found admin in Auth');
    console.log('   ID:', adminAuth.id);
    console.log('   Email:', adminAuth.email);
    
    // Insert or update in users table
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: adminAuth.id,
        email: 'admin@jospia.com',
        full_name: 'Administrateur JOSPIA',
        role: 'admin'
      }, {
        onConflict: 'id'
      })
      .select();
    
    if (error) {
      console.error('\n❌ Error syncing to users table:', error.message);
      return;
    }
    
    console.log('\n✅ Admin synced to users table!');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n═══════════════════════════════════════════════');
    console.log('🎉 Admin is ready to login!');
    console.log('═══════════════════════════════════════════════\n');
    console.log('📧 Credentials:');
    console.log('   Email: admin@jospia.com');
    console.log('   Password: Admin@123456\n');
    console.log('🔗 Login at: http://localhost:3000/login\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

syncAdmin().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
