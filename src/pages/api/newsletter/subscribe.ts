import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import {
    sendSubscriberNotification,
    isValidEmail,
    sanitizeEmail
} from '../../../lib/email-notification';

/**
 * API Endpoint untuk notifikasi newsletter subscriber
 * POST /api/newsletter/subscribe
 */

// Fallback ke PUBLIC_SUPABASE_URL jika SUPABASE_URL tidak tersedia
const supabaseUrl =
    import.meta.env.SUPABASE_URL ||
    import.meta.env.PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.PUBLIC_SUPABASE_URL;
// POST but still allow fallback anon key in dev; DB insert will fail if RLS on, but better than throw
const supabaseServiceKey =
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.PUBLIC_SUPABASE_ANON_KEY;

const getSupabaseClient = () => {
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration missing');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
};

export const POST: APIRoute = async ({ request }) => {
    try {
        // Parse request body
        const body = await request.json();
        const { email, source } = body;

        // Validasi input
        if (!email) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Email is required'
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Sanitize dan validasi email
        const cleanEmail = sanitizeEmail(email);

        if (!isValidEmail(cleanEmail)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Invalid email format'
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Ambil informasi tambahan
        const userAgent = request.headers.get('user-agent') || undefined;
        const timestamp = new Date().toISOString();

        // Kirim notifikasi
        const result = await sendSubscriberNotification({
            email: cleanEmail,
            timestamp,
            source: source || 'unknown',
            userAgent,
        });

        // Store notification in database for admin dashboard
        if (result.success) {
            try {
                const supabase = getSupabaseClient();
                
                // Generate unique ID for notification
                const notificationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                
                // Store notification in database
                const { error: notificationError } = await supabase
                    .from('notifications')
                    .insert([{
                        id: notificationId,
                        type: 'newsletter',
                        title: '📧 Newsletter Subscriber Baru',
                        message: `${cleanEmail} berlangganan newsletter`,
                        metadata: {
                            email: cleanEmail,
                            source: source || 'unknown',
                            userAgent: userAgent || 'Unknown',
                            timestamp,
                        },
                        read: false,
                        timestamp: new Date().toISOString(),
                    }]);

                if (notificationError) {
                    console.error('Error storing notification:', notificationError);
                    // Don't fail the whole request if notification storage fails
                } else {
                    console.log('✅ Notification stored in database for admin dashboard');
                }
            } catch (error) {
                console.error('Failed to store notification in database:', error);
                // Don't fail the whole request if notification storage fails
            }
        }

        // Return response
        return new Response(
            JSON.stringify({
                success: result.success,
                message: result.message,
                data: {
                    email: cleanEmail,
                    timestamp,
                }
            }),
            {
                status: result.success ? 200 : 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Newsletter subscribe API error:', error);

        return new Response(
            JSON.stringify({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};

// Method GET untuk testing
export const GET: APIRoute = async () => {
    return new Response(
        JSON.stringify({
            message: 'Newsletter Subscribe API',
            endpoint: 'POST /api/newsletter/subscribe',
            requiredFields: ['email'],
            optionalFields: ['source']
        }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }
    );
};
