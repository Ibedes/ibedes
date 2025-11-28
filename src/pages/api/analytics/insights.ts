import type { APIRoute } from "astro";
import {
    getDeviceBreakdown,
    getPageViewsTrend,
    getPerformanceOverview,
    getConversionInsights,
    getReferrerBreakdown,
    getRecentEvents,
    getAffiliateClicksSummary,
} from "../../../lib/analytics-store";

type CacheEntry = {
    data: Record<string, unknown>;
    timestamp: number;
    days: number;
} | null;

let cache: CacheEntry = null;
const CACHE_TTL = 2 * 60 * 1000;

export const GET: APIRoute = async ({ url }) => {
    const rawDays = Number(url.searchParams.get("days"));
    const days = Number.isFinite(rawDays)
        ? Math.min(Math.max(Math.floor(rawDays), 1), 30)
        : 7;

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
        const [
            trend,
            device,
            performance,
            conversions,
            referrers,
            recentEvents,
            affiliateClicks,
        ] =
            await Promise.all([
                getPageViewsTrend(days),
                getDeviceBreakdown(days),
                getPerformanceOverview(days),
                getConversionInsights(days),
                getReferrerBreakdown(days),
                getRecentEvents(25),
                getAffiliateClicksSummary(days),
            ]);

        const data = {
            trend,
            device,
            performance,
            conversions,
            referrers,
            recentEvents,
            affiliateClicks,
            days,
            timestamp: now,
        };

        cache = { data, timestamp: now, days };

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("[Analytics] Insights endpoint error:", error);
        return new Response(
            JSON.stringify({ error: "Failed to build analytics insights" }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
    }
};
