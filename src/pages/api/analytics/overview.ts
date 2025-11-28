import type { APIRoute } from "astro";
import { getOverviewMetricsFromEvents } from "../../../lib/analytics-store";

interface CacheEntry {
    data: Record<string, unknown>;
    timestamp: number;
    days: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const GET: APIRoute = async ({ url }) => {
    const rawDays = Number(url.searchParams.get("days"));
    const days = Number.isFinite(rawDays) ? Math.max(1, Math.min(60, rawDays)) : 28;
    const now = Date.now();

    if (cache && now - cache.timestamp < CACHE_TTL && cache.days === days) {
        return new Response(JSON.stringify(cache.data), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    try {
        const metrics = await getOverviewMetricsFromEvents(days);
        const data = {
            sessions: metrics.sessions,
            users: metrics.totalUsers,
            pageViews: metrics.pageViews,
            avgDuration: metrics.averageSessionDuration,
            timestamp: metrics.timestamp,
        };

        cache = { data, timestamp: now, days };

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("[Analytics] Overview endpoint error:", error);
        return new Response(
            JSON.stringify({
                error: "Failed to build analytics overview",
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
    }
};
