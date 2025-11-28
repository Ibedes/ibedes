import type { APIRoute } from "astro";
import { getRealtimeSnapshot, getTopPages } from "../../../lib/analytics-store";

interface CacheEntry {
    data: Record<string, unknown>;
    timestamp: number;
    minutes: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute

export const GET: APIRoute = async ({ url }) => {
    const minutesParam = Number(url.searchParams.get("minutes"));
    const minutes = Number.isFinite(minutesParam)
        ? Math.max(5, Math.min(60, minutesParam))
        : 30;
    const now = Date.now();

    if (cache && now - cache.timestamp < CACHE_TTL && cache.minutes === minutes) {
        return new Response(JSON.stringify(cache.data), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    try {
        const [snapshot, topPages] = await Promise.all([
            getRealtimeSnapshot(minutes),
            getTopPages(7, 5),
        ]);

        const data = {
            activeUsers: snapshot.activeUsers,
            pageViews: snapshot.pageViews,
            topPages,
            timestamp: snapshot.timestamp,
        };

        cache = { data, timestamp: now, minutes };

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("[Analytics] Realtime endpoint error:", error);
        return new Response(
            JSON.stringify({ error: "Failed to fetch realtime analytics" }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
    }
};
