/**
 * Unified Notification System
 * Mengelola notifikasi untuk newsletter, likes, dan comments
 * Integrated with Supabase for persistence
 */

export type NotificationType = 'newsletter' | 'like' | 'comment' | 'bookmark';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: {
        email?: string;
        articleSlug?: string;
        articleTitle?: string;
        commentText?: string;
        userHash?: string;
        source?: string;
    };
    timestamp: string;
    read: boolean;
}

export interface NotificationStore {
    notifications: Notification[];
    unreadCount: number;
}

import { supabase } from './supabase';

const STORAGE_KEY = 'ibedes:admin:notifications';
const MAX_NOTIFICATIONS = 100;

const isSupabaseEnabled = () => !!supabase;

/**
 * Load notifications from Supabase (primary) or localStorage (fallback)
 */
export async function loadNotifications(): Promise<NotificationStore> {
    if (typeof window === 'undefined') {
        return { notifications: [], unreadCount: 0 };
    }

    try {
        // Try Supabase first
        if (isSupabaseEnabled()) {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(MAX_NOTIFICATIONS);

            if (!error && data) {
                const notifications = data.map(normalizeSupabaseNotification);
                const unreadCount = notifications.filter(n => !n.read).length;
                return { notifications, unreadCount };
            }
        }
    } catch (error) {
        console.warn('Failed to load from Supabase, falling back to localStorage:', error);
    }

    // Fallback to localStorage
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return { notifications: [], unreadCount: 0 };
        }

        const data = JSON.parse(stored);
        return {
            notifications: data.notifications || [],
            unreadCount: data.unreadCount || 0,
        };
    } catch (error) {
        console.error('Error loading notifications from localStorage:', error);
        return { notifications: [], unreadCount: 0 };
    }
}

/**
 * Normalize Supabase notification to our interface
 */
function normalizeSupabaseNotification(record: any): Notification {
    return {
        id: record.id,
        type: record.type,
        title: record.title,
        message: record.message,
        metadata: record.metadata || {},
        timestamp: record.timestamp,
        read: record.read || false,
    };
}

/**
 * Save notifications to localStorage
 */
export function saveNotifications(store: NotificationStore): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (error) {
        console.error('Error saving notifications:', error);
    }
}

/**
 * Add a new notification
 */
export async function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<Notification> {
    const newNotification: Notification = {
        ...notification,
        id: generateId(),
        timestamp: new Date().toISOString(),
        read: false,
    };

    try {
        // Try Supabase first
        if (isSupabaseEnabled()) {
            const { data, error } = await supabase
                .from('notifications')
                .insert([{
                    id: newNotification.id,
                    type: newNotification.type,
                    title: newNotification.title,
                    message: newNotification.message,
                    metadata: newNotification.metadata || {},
                    timestamp: newNotification.timestamp,
                    read: newNotification.read,
                }])
                .select()
                .single();

            if (!error && data) {
                return normalizeSupabaseNotification(data);
            }
        }
    } catch (error) {
        console.warn('Failed to save to Supabase, falling back to localStorage:', error);
    }

    // Fallback to localStorage
    const store = await loadNotifications();
    store.notifications.unshift(newNotification);

    // Keep only the latest MAX_NOTIFICATIONS
    if (store.notifications.length > MAX_NOTIFICATIONS) {
        store.notifications = store.notifications.slice(0, MAX_NOTIFICATIONS);
    }

    store.unreadCount = store.notifications.filter((n: Notification) => !n.read).length;
    saveNotifications(store);

    return newNotification;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
    try {
        // Try Supabase first
        if (isSupabaseEnabled()) {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId);

            if (!error) return;
        }
    } catch (error) {
        console.warn('Failed to update in Supabase, falling back to localStorage:', error);
    }

    // Fallback to localStorage
    const store = await loadNotifications();
    const notification = store.notifications.find((n: Notification) => n.id === notificationId);

    if (notification && !notification.read) {
        notification.read = true;
        store.unreadCount = Math.max(0, store.unreadCount - 1);
        saveNotifications(store);
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
    try {
        // Try Supabase first
        if (isSupabaseEnabled()) {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('read', false);

            if (!error) return;
        }
    } catch (error) {
        console.warn('Failed to update in Supabase, falling back to localStorage:', error);
    }

    // Fallback to localStorage
    const store = await loadNotifications();
    store.notifications.forEach((n: Notification) => n.read = true);
    store.unreadCount = 0;
    saveNotifications(store);
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
    try {
        // Try Supabase first
        if (isSupabaseEnabled()) {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId);

            if (!error) return;
        }
    } catch (error) {
        console.warn('Failed to delete from Supabase, falling back to localStorage:', error);
    }

    // Fallback to localStorage
    const store = await loadNotifications();
    const index = store.notifications.findIndex((n: Notification) => n.id === notificationId);

    if (index !== -1) {
        const notification = store.notifications[index];
        if (!notification.read) {
            store.unreadCount = Math.max(0, store.unreadCount - 1);
        }
        store.notifications.splice(index, 1);
        saveNotifications(store);
    }
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): void {
    saveNotifications({ notifications: [], unreadCount: 0 });
}

/**
 * Get notifications by type
 */
export async function getNotificationsByType(type: NotificationType): Promise<Notification[]> {
    const store = await loadNotifications();
    return store.notifications.filter((n: Notification) => n.type === type);
}

/**
 * Get unread notifications
 */
export async function getUnreadNotifications(): Promise<Notification[]> {
    const store = await loadNotifications();
    return store.notifications.filter((n: Notification) => !n.read);
}

/**
 * Generate unique ID
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format notification based on type
 */
export function formatNotification(type: NotificationType, metadata: any): Omit<Notification, 'id' | 'timestamp' | 'read'> {
    switch (type) {
        case 'newsletter':
            return {
                type: 'newsletter',
                title: '📧 Newsletter Subscriber Baru',
                message: `${metadata.email || 'Someone'} berlangganan newsletter`,
                metadata: {
                    email: metadata.email,
                    source: metadata.source,
                },
            };

        case 'like':
            return {
                type: 'like',
                title: '❤️ Like Baru',
                message: `Artikel "${metadata.articleTitle || 'Unknown'}" mendapat like`,
                metadata: {
                    articleSlug: metadata.articleSlug,
                    articleTitle: metadata.articleTitle,
                    userHash: metadata.userHash,
                },
            };

        case 'comment':
            return {
                type: 'comment',
                title: '💬 Komentar Baru',
                message: `Komentar baru di "${metadata.articleTitle || 'Unknown'}"`,
                metadata: {
                    articleSlug: metadata.articleSlug,
                    articleTitle: metadata.articleTitle,
                    commentText: metadata.commentText,
                    userHash: metadata.userHash,
                },
            };

        case 'bookmark':
            return {
                type: 'bookmark',
                title: '🔖 Bookmark Baru',
                message: `Artikel "${metadata.articleTitle || 'Unknown'}" di-bookmark`,
                metadata: {
                    articleSlug: metadata.articleSlug,
                    articleTitle: metadata.articleTitle,
                    userHash: metadata.userHash,
                },
            };

        default:
            return {
                type: 'newsletter',
                title: '🔔 Notifikasi Baru',
                message: 'Ada aktivitas baru',
                metadata,
            };
    }
}
