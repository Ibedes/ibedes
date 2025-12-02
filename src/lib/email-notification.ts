/**
 * Email Notification Utility
 * Fungsi untuk mengirim notifikasi email ketika ada subscriber baru
 */

export interface SubscriberNotification {
    email: string;
    timestamp: string;
    source: string; // halaman asal subscribe
    userAgent?: string;
}

/**
 * Mengirim notifikasi ke admin via email
 * Menggunakan service email (bisa disesuaikan dengan provider yang digunakan)
 */
export async function sendSubscriberNotification(
    data: SubscriberNotification
): Promise<{ success: boolean; message: string }> {
    try {
        const { email, timestamp, source, userAgent } = data;

        // Format email body
        const emailBody = `
🎉 Newsletter Subscriber Baru!

📧 Email: ${email}
🕒 Waktu: ${new Date(timestamp).toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta',
            dateStyle: 'full',
            timeStyle: 'long'
        })}
📍 Halaman: ${source}
🖥️ User Agent: ${userAgent || 'Unknown'}

---
Notifikasi otomatis dari ibedes.xyz
    `.trim();

        // Opsi 1: Menggunakan Telegram Bot (Recommended - Gratis dan mudah)
        const telegramBotToken = import.meta.env.TELEGRAM_BOT_TOKEN;
        const telegramChatId = import.meta.env.TELEGRAM_CHAT_ID;

        if (telegramBotToken && telegramChatId) {
            const telegramResponse = await fetch(
                `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: telegramChatId,
                        text: emailBody,
                        parse_mode: 'HTML',
                    }),
                }
            );

            if (telegramResponse.ok) {
                return { success: true, message: 'Notifikasi terkirim via Telegram' };
            }
        }

        // Opsi 2: Menggunakan Discord Webhook (Alternative)
        const discordWebhook = import.meta.env.DISCORD_WEBHOOK_URL;

        if (discordWebhook) {
            const discordResponse = await fetch(discordWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embeds: [
                        {
                            title: '🎉 Newsletter Subscriber Baru!',
                            color: 0x10b981, // Green color
                            fields: [
                                { name: '📧 Email', value: email, inline: false },
                                {
                                    name: '🕒 Waktu',
                                    value: new Date(timestamp).toLocaleString('id-ID', {
                                        timeZone: 'Asia/Jakarta'
                                    }),
                                    inline: true
                                },
                                { name: '📍 Halaman', value: source, inline: true },
                                { name: '🖥️ User Agent', value: userAgent || 'Unknown', inline: false },
                            ],
                            footer: {
                                text: 'ibedes.xyz Newsletter System',
                            },
                            timestamp: new Date(timestamp).toISOString(),
                        },
                    ],
                }),
            });

            if (discordResponse.ok) {
                return { success: true, message: 'Notifikasi terkirim via Discord' };
            }
        }

        // Opsi 3: Simpan ke database/file log sebagai fallback
        console.log('📧 New Subscriber:', data);

        return {
            success: true,
            message: 'Subscriber logged (no notification service configured)'
        };

    } catch (error) {
        console.error('Error sending subscriber notification:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Validasi email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sanitize email untuk keamanan
 */
export function sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
}
