// Test if routes can be loaded
console.log('Testing route loading...\n');

try {
  console.log('1. Loading auth.routes...');
  const authRoutes = require('./src/routes/auth.routes');
  console.log('✅ auth.routes loaded');
  console.log('   Type:', typeof authRoutes);
} catch (error) {
  console.error('❌ Failed to load auth.routes:');
  console.error('   ', error.message);
  console.error('\n   Stack:', error.stack);
}

try {
  console.log('\n2. Loading auth.controller...');
  const authController = require('./src/controllers/auth.controller');
  console.log('✅ auth.controller loaded');
  console.log('   Exports:', Object.keys(authController));
} catch (error) {
  console.error('❌ Failed to load auth.controller:');
  console.error('   ', error.message);
}

try {
  console.log('\n3. Loading validation...');
  const validation = require('./src/utils/validation');
  console.log('✅ validation loaded');
} catch (error) {
  console.error('❌ Failed to load validation:');
  console.error('   ', error.message);
}

try {
  console.log('\n4. Loading emailService...');
  const emailService = require('./src/utils/emailService');
  console.log('✅ emailService loaded');
} catch (error) {
  console.error('❌ Failed to load emailService:');
  console.error('   ', error.message);
}

try {
  console.log('\n5. Loading supabase config...');
  const supabase = require('./src/config/supabase');
  console.log('✅ supabase config loaded');
} catch (error) {
  console.error('❌ Failed to load supabase:');
  console.error('   ', error.message);
}
