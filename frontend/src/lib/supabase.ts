import { createClient } from '@supabase/supabase-js';

// Utiliser des valeurs par défaut si les variables d'environnement ne sont pas définies
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ngifuimxbeynzzzuwrhq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5naWZ1aW14YmV5bnp6enV3cmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjIyNDIsImV4cCI6MjA3ODUzODI0Mn0.cIdhjbnRRq_ZwYqi_bcdg_jk1L9jO62FunuyoIg2zV4';

// Créer le client Supabase (sera configuré plus tard)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
