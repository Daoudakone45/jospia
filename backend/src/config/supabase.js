const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️  Missing Supabase environment variables');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_KEY:', supabaseKey ? '✓' : '✗');
  console.error('   Check your .env file');
  process.exit(1);
}

// Create Supabase client with minimal configuration to avoid blocking
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  },
  db: {
    schema: 'public'
  },
  // Optimisations réseau
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Test connection without blocking
(async () => {
  try {
    const { error } = await Promise.race([
      supabase.from('users').select('count').limit(0),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 3000))
    ]);
    if (error && error.message !== 'Connection timeout') {
      console.warn('⚠️  Supabase connection warning:', error.message);
    } else {
      console.log('✓ Supabase connected');
    }
  } catch (err) {
    console.warn('⚠️  Supabase connection check failed (non-blocking):', err.message);
  }
})();

module.exports = supabase;
