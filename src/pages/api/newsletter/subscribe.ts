import type { APIRoute } from 'astro';
import {
    sendSubscriberNotification,
    isValidEmail,
    sanitizeEmail
} from '../../../lib/email-notification';

/**
 * API Endpoint untuk notifikasi newsletter subscriber
 * POST /api/newsletter/subscribe
 */
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

        // Broadcast notification to admin dashboard
        // This would typically use Server-Sent Events or WebSocket
        // For now, we log it for the admin to pick up via polling
        if (result.success) {
            console.log('[Admin Notification] New newsletter subscriber:', {
                type: 'newsletter',
                email: cleanEmail,
                source: source || 'unknown',
                timestamp,
            });
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
