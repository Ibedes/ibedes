import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Load .env during SSR/Node execution even when the process wasn't started
// with `-r dotenv/config`. Tree-shaken from client bundles.
if (import.meta.env?.SSR) {
  await import('dotenv/config');
}

// SERVER-ONLY: baca env baik dari import.meta.env (build time) maupun process.env (runtime)
const supabaseUrl =
  import.meta.env?.SUPABASE_URL ||
  import.meta.env?.PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.PUBLIC_SUPABASE_URL;

const serviceRoleKey =
  import.meta.env?.SUPABASE_SERVICE_ROLE_KEY ||
  import.meta.env?.PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: SupabaseClient | null = null;
const hasSupabaseAdminConfig = Boolean(supabaseUrl && serviceRoleKey);

if (!hasSupabaseAdminConfig) {
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

export { supabaseAdmin, hasSupabaseAdminConfig };
