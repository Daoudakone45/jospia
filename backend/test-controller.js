require('dotenv').config();

console.log('Testing auth controller loading...\n');
console.log('Environment check:');
console.log('  SUPABASE_URL:', process.env.SUPABASE_URL ? '✓' : '✗');
console.log('  SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✓' : '✗');
console.log('');

try {
  console.log('1. Loading supabase config...');
  const supabase = require('./src/config/supabase');
  console.log('✅ Supabase loaded');
  console.log('   Type:', typeof supabase);
  
  console.log('\n2. Loading validation...');
  const validation = require('./src/utils/validation');
  console.log('✅ Validation loaded');
  
  console.log('\n3. Loading emailService...');
  const emailService = require('./src/utils/emailService');
  console.log('✅ EmailService loaded');
  
  console.log('\n4. Loading auth.controller...');
  const authController = require('./src/controllers/auth.controller');
  console.log('✅ Auth controller loaded');
  console.log('   Exports:', Object.keys(authController));
  
  console.log('\n✅ All modules loaded successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error('\nStack:', error.stack);
  process.exit(1);
}
