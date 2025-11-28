import type { APIRoute } from "astro";
import { getOverviewMetrics } from "../../../lib/ga4";

// Simple in-memory cache
let cache: {
    data: any;
    timestamp: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache for historical data

export const GET: APIRoute = async () => {
    const now = Date.now();

    // Return cached data if valid
    if (cache && now - cache.timestamp < CACHE_TTL) {
        return new Response(JSON.stringify(cache.data), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    try {
        const metrics = await getOverviewMetrics();

        const data = {
            sessions: metrics?.sessions || 0,
            users: metrics?.totalUsers || 0,
            pageViews: metrics?.screenPageViews || 0,
            avgDuration: metrics?.averageSessionDuration || 0,
            timestamp: now
        };

        // Update cache
        cache = {
            data,
            timestamp: now
        };

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch analytics" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
};
