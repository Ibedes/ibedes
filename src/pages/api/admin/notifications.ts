import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

/**
 * API Endpoint untuk notifikasi admin
 * GET: Retrieve notifications
 * POST: Add new notification
 * DELETE: Clear notifications
 */

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

const getSupabaseClient = () => {
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration missing');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
};

const getNotificationTitle = (type: string, metadata: any): string => {
    switch (type) {
        case 'newsletter':
            return '📧 Newsletter Subscriber Baru';
        case 'like':
            return '❤️ Like Baru';
        case 'comment':
            return '💬 Komentar Baru';
        case 'bookmark':
            return '🔖 Bookmark Baru';
        default:
            return '🔔 Notifikasi Baru';
    }
};

const getNotificationMessage = (type: string, metadata: any): string => {
    switch (type) {
        case 'newsletter':
            return `${metadata.email || 'Someone'} berlangganan newsletter`;
        case 'like':
            return `Artikel "${metadata.articleTitle || 'Unknown'}" mendapat like`;
        case 'comment':
            return `Komentar baru di "${metadata.articleTitle || 'Unknown'}"`;
        case 'bookmark':
            return `Artikel "${metadata.articleTitle || 'Unknown'}" di-bookmark`;
        default:
            return 'Ada aktivitas baru';
    }
};

export const GET: APIRoute = async ({ request, url }) => {
    try {
        const since = url.searchParams.get('since');
        const type = url.searchParams.get('type');
        const unreadOnly = url.searchParams.get('unread') === 'true';

        const supabase = getSupabaseClient();

        let query = supabase
            .from('notifications')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100);

        if (since) {
            query = query.gt('timestamp', since);
        }

        if (type) {
            query = query.eq('type', type);
        }

        if (unreadOnly) {
            query = query.eq('read', false);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        const notifications = data || [];
        const unreadCount = notifications.filter(n => !n.read).length;

        return new Response(
            JSON.stringify({
                success: true,
                notifications,
                unreadCount,
                message: 'Notifications retrieved from Supabase',
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Failed to fetch notifications',
                error: error instanceof Error ? error.message : 'Unknown error',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { type, metadata } = body;

        if (!type) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Notification type is required',
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        const supabase = getSupabaseClient();

        // Format notification data
        const notificationData = {
            type,
            title: getNotificationTitle(type, metadata),
            message: getNotificationMessage(type, metadata),
            metadata: metadata || {},
            read: false,
        };

        const { data, error } = await supabase
            .from('notifications')
            .insert([notificationData])
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Log notification event
        console.log(`[Notification] ${type}:`, metadata);

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Notification stored in Supabase',
                data,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error creating notification:', error);
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Failed to create notification',
                error: error instanceof Error ? error.message : 'Unknown error',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};

export const PATCH: APIRoute = async ({ request, url }) => {
    try {
        const notificationId = url.searchParams.get('id');
        const markAllRead = url.searchParams.get('markAllRead') === 'true';
        const supabase = getSupabaseClient();

        if (markAllRead) {
            // Mark all notifications as read
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('read', false);

            if (error) throw error;

            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'All notifications marked as read',
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        } else if (notificationId) {
            // Mark specific notification as read
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId);

            if (error) throw error;

            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Notification marked as read',
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        } else {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Missing notification ID or markAllRead parameter',
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }
    } catch (error) {
        console.error('Error updating notification:', error);
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Failed to update notification',
                error: error instanceof Error ? error.message : 'Unknown error',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};

export const DELETE: APIRoute = async ({ url }) => {
    try {
        const notificationId = url.searchParams.get('id');
        const supabase = getSupabaseClient();

        if (notificationId) {
            // Delete specific notification
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId);

            if (error) throw error;

            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Notification deleted',
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        } else {
            // Clear all notifications
            const { error } = await supabase
                .from('notifications')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

            if (error) throw error;

            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'All notifications cleared',
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }
    } catch (error) {
        console.error('Error clearing notifications:', error);
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Failed to clear notifications',
                error: error instanceof Error ? error.message : 'Unknown error',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};

