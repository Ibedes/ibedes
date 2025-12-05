import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Supabase client will not be initialized.');
}

// Public client (for frontend, respects RLS)
export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            persistSession: true,
        },
    }
);

// Admin client (for backend/API routes, bypasses RLS)
// Only use this in server-side code!
export const supabaseAdmin = createClient(
    supabaseUrl || '',
    supabaseServiceKey || supabaseAnonKey || '',
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    }
);

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
