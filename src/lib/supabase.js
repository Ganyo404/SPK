import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  '';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  '';

// Database belum aktif / belum dibuat sesuai instruksi pengguna;
// Set VITE_USE_SUPABASE=true di .env jika database Supabase sudah diinisialisasi
const isSupabaseEnabled = import.meta.env.VITE_USE_SUPABASE === 'true';

export const isSupabaseConfigured = () => {
  return Boolean(
    isSupabaseEnabled &&
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-ref.supabase.co' &&
    !supabaseUrl.includes('your-project-ref') &&
    supabaseAnonKey !== 'your-anon-or-publishable-key-here'
  );
};

export const getSupabaseUrl = () => supabaseUrl;

// Inisialisasi Supabase client jika variabel env valid
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;
