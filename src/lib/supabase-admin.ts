import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// SERVER-ONLY: gunakan process.env, tapi jangan bikin dev crash kalau variabel belum di-set
const supabaseUrl = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  // fallback supaya tetap jalan kalau yang diset hanya PUBLIC_*
  process.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: SupabaseClient | null = null;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('[Supabase Admin] Missing environment variables, admin client not initialized', {
    hasUrl: !!supabaseUrl,
    hasServiceRoleKey: !!serviceRoleKey,
  });
} else {
  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export { supabaseAdmin };
