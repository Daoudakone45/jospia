#!/usr/bin/env node
/**
 * Simple script to create admin user in Supabase
 * Run with: node create-admin-simple.js
 */

const https = require('https');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_EMAIL = 'admin@jospia.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'Administrateur JOSPIA';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

console.log('🔄 Creating admin user via Supabase Auth API...\n');

// Extract project ref from URL
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
const authUrl = `${SUPABASE_URL}/auth/v1/admin/users`;

const userData = JSON.stringify({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  email_confirm: true,
  user_metadata: {
    full_name: ADMIN_NAME
  }
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
  }
};

// Make request
const req = https.request(authUrl, options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ User created in Auth!');
        console.log('User ID:', response.id);
        console.log('\nNow inserting into users table...');
        
        // Insert into users table
        insertIntoUsersTable(response.id);
      } else if (response.msg && response.msg.includes('already been registered')) {
        console.log('⚠️  User already exists in Auth');
        console.log('Checking users table...');
        // Try to get existing user ID
        checkExistingUser();
      } else {
        console.error('❌ Error:', response);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Parse error:', error);
      console.error('Response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error);
  process.exit(1);
});

req.write(userData);
req.end();

function insertIntoUsersTable(userId) {
  const usersUrl = `${SUPABASE_URL}/rest/v1/users`;
  
  const userRecord = JSON.stringify({
    id: userId,
    email: ADMIN_EMAIL,
    full_name: ADMIN_NAME,
    role: 'admin'
  });
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation'
    }
  };
  
  const req = https.request(usersUrl, options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 201 || res.statusCode === 200) {
        console.log('✅ Admin role added to users table!\n');
        printSuccess();
      } else {
        console.error('❌ Error inserting into users table');
        console.error('Status:', res.statusCode);
        console.error('Response:', data);
        process.exit(1);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Request error:', error);
    process.exit(1);
  });
  
  req.write(userRecord);
  req.end();
}

function checkExistingUser() {
  console.log('\n⚠️  Please create admin manually:');
  console.log('1. Go to Supabase Dashboard → Authentication → Users');
  console.log('2. Find user: admin@jospia.com');
  console.log('3. Copy the User ID');
  console.log('4. Go to Table Editor → users');
  console.log('5. Update the role to "admin"');
  console.log('\nOr run this SQL query:');
  console.log(`\nUPDATE users SET role = 'admin' WHERE email = '${ADMIN_EMAIL}';\n`);
  process.exit(0);
}

function printSuccess() {
  console.log('═══════════════════════════════════════════════');
  console.log('🎉 Admin user created successfully!');
  console.log('═══════════════════════════════════════════════\n');
  console.log('📧 Admin Credentials:');
  console.log('   Email:    ' + ADMIN_EMAIL);
  console.log('   Password: ' + ADMIN_PASSWORD);
  console.log('   Role:     admin\n');
  console.log('🔗 Login at: http://localhost:3000/login\n');
}
