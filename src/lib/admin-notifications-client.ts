import { addNotification, formatNotification } from './notifications';

/**
 * Client-side helper untuk mengirim notifikasi ke admin dashboard
 * Digunakan oleh komponen seperti FloatingReactions untuk like & comment
 */

export interface NotificationPayload {
    type: 'newsletter' | 'like' | 'comment' | 'bookmark';
    metadata: {
        email?: string;
        articleSlug?: string;
        articleTitle?: string;
        commentText?: string;
        userHash?: string;
        source?: string;
    };
}

/**
 * Kirim notifikasi ke admin dashboard
 */
export async function sendAdminNotification(payload: NotificationPayload): Promise<void> {
    try {
        // 1. Simpan ke API/Supabase (ini yang mentrigger update di dashboard tab lain)
        const notification = formatNotification(payload.type, payload.metadata);
        await addNotification(notification);

        // 2. Dispatch custom event (untuk update UI di tab yang sama jika ada listener)
        window.dispatchEvent(new CustomEvent('notification:new', {
            detail: payload
        }));

        // 3. Kirim notifikasi ke Telegram untuk like dan comment
        if (payload.type === 'like' || payload.type === 'comment') {
            sendToTelegram(payload).catch(err => {
                console.warn('Failed to send Telegram notification:', err);
            });
        }

    } catch (error) {
        console.error('Error sending admin notification:', error);
    }
}

/**
 * Kirim notifikasi untuk like baru
 */
export function notifyLike(articleSlug: string, articleTitle: string): void {
    sendAdminNotification({
        type: 'like',
        metadata: {
            articleSlug,
            articleTitle,
            userHash: getUserHash(),
        }
    });
}

/**
 * Kirim notifikasi untuk komentar baru
 */
export function notifyComment(
    articleSlug: string,
    articleTitle: string,
    commentText: string
): void {
    sendAdminNotification({
        type: 'comment',
        metadata: {
            articleSlug,
            articleTitle,
            commentText: truncateText(commentText, 100),
            userHash: getUserHash(),
        }
    });
}

/**
 * Kirim notifikasi untuk bookmark baru
 */
export function notifyBookmark(articleSlug: string, articleTitle: string): void {
    sendAdminNotification({
        type: 'bookmark',
        metadata: {
            articleSlug,
            articleTitle,
            userHash: getUserHash(),
        }
    });
}

/**
 * Get user hash (simplified version)
 */
function getUserHash(): string {
    let hash = localStorage.getItem('ibedes:user:hash');
    if (!hash) {
        hash = generateHash();
        localStorage.setItem('ibedes:user:hash', hash);
    }
    return hash;
}

/**
 * Generate simple hash
 */
function generateHash(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Truncate text
 */
function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

/**
 * Send notification to Telegram
 */
async function sendToTelegram(payload: NotificationPayload): Promise<void> {
    try {
        const telegramBotToken = import.meta.env.TELEGRAM_BOT_TOKEN;
        const telegramChatId = import.meta.env.TELEGRAM_CHAT_ID;

        if (!telegramBotToken || !telegramChatId) {
            console.warn('Telegram credentials not configured');
            return;
        }

        let message = '';

        if (payload.type === 'like') {
            message = `
❤️ <b>Like Baru!</b>

📄 <b>Artikel:</b> ${payload.metadata.articleTitle || 'Unknown'}
🔗 <b>Slug:</b> ${payload.metadata.articleSlug || 'unknown'}
👤 <b>User:</b> ${payload.metadata.userHash || 'anonymous'}
🕒 <b>Waktu:</b> ${new Date().toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                dateStyle: 'short',
                timeStyle: 'medium'
            })}

---
Notifikasi otomatis dari ibedes.xyz
            `.trim();
        } else if (payload.type === 'comment') {
            message = `
💬 <b>Komentar Baru!</b>

📄 <b>Artikel:</b> ${payload.metadata.articleTitle || 'Unknown'}
🔗 <b>Slug:</b> ${payload.metadata.articleSlug || 'unknown'}
👤 <b>User:</b> ${payload.metadata.userHash || 'anonymous'}
💭 <b>Komentar:</b> ${truncateText(payload.metadata.commentText || '', 200)}
🕒 <b>Waktu:</b> ${new Date().toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                dateStyle: 'short',
                timeStyle: 'medium'
            })}

---
Notifikasi otomatis dari ibedes.xyz
            `.trim();
        }

        if (message) {
            const response = await fetch(
                `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: telegramChatId,
                        text: message,
                        parse_mode: 'HTML',
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Telegram API error: ${response.status}`);
            }
        }
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
        throw error;
    }
}
