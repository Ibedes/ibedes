import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Support both Astro runtime (import.meta.env) and direct Node execution (process.env)
const supabaseUrl = import.meta.env?.PUBLIC_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_URL : undefined);
const supabaseAnonKey = import.meta.env?.PUBLIC_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_ANON_KEY : undefined);
const supabaseServiceKey = import.meta.env?.SUPABASE_SERVICE_ROLE_KEY || (typeof process !== 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined);

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
    console.warn(
        'Supabase URL or Anon Key is missing. Supabase client will not be initialized; falling back to local data where possible.'
    );
}

let supabase: SupabaseClient | null = null;
let supabaseAdmin: SupabaseClient | null = null;

if (hasSupabaseConfig) {
    supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
        auth: {
            persistSession: true,
            storageKey: 'sb-ibedes-auth',
        },
    });

    const adminKey = supabaseServiceKey || supabaseAnonKey!;
    supabaseAdmin = createClient(supabaseUrl!, adminKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

export { supabase, supabaseAdmin, hasSupabaseConfig };

export type Database = {
    public: {
        Tables: {
            affiliate_products: {
                Row: {
                    id: string;
                    name: string;
                    description: string | null;
                    price: number | null;
                    original_price: number | null;
                    discount: string | null;
                    image: string | null;
                    link: string | null;
                    platform: string | null;
                    category: string | null;
                    tags: string[] | null;
                    rating: number | null;
                    verified: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    name: string;
                    description?: string | null;
                    price?: number | null;
                    original_price?: number | null;
                    discount?: string | null;
                    image?: string | null;
                    link?: string | null;
                    platform?: string | null;
                    category?: string | null;
                    tags?: string[] | null;
                    rating?: number | null;
                    verified?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string | null;
                    price?: number | null;
                    original_price?: number | null;
                    discount?: string | null;
                    image?: string | null;
                    link?: string | null;
                    platform?: string | null;
                    category?: string | null;
                    tags?: string[] | null;
                    rating?: number | null;
                    verified?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            // Add other table types here as needed
        };
    };
};
