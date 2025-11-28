import { BetaAnalyticsDataClient } from "@google-analytics/data";

const propertyId = import.meta.env.GA4_PROPERTY_ID;
const serviceAccountPath = import.meta.env.GA4_SERVICE_ACCOUNT_PATH;

// Initialize client with credentials
// We use a factory function to handle potential missing credentials gracefully
const getClient = () => {
    if (!serviceAccountPath) {
        console.warn("GA4_SERVICE_ACCOUNT_PATH is not set");
        return null;
    }

    try {
        return new BetaAnalyticsDataClient({
            keyFilename: serviceAccountPath,
        });
    } catch (error) {
        console.error("Failed to initialize GA4 client:", error);
        return null;
    }
};

const client = getClient();

export interface RealtimeMetrics {
    activeUsers: number;
    screenPageViews: number;
}

export interface TopPage {
    path: string;
    title: string;
    views: number;
}

export const getRealtimeMetrics = async (): Promise<RealtimeMetrics | null> => {
    if (!client || !propertyId) return null;

    try {
        const [response] = await client.runRealtimeReport({
            property: `properties/${propertyId}`,
            metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
            minuteRanges: [{ name: "0-29 minutes ago", startMinutesAgo: 29, endMinutesAgo: 0 }],
        });

        const activeUsers = parseInt(response.rows?.[0]?.metricValues?.[0]?.value || "0", 10);
        const screenPageViews = parseInt(response.rows?.[0]?.metricValues?.[1]?.value || "0", 10);

        return { activeUsers, screenPageViews };
    } catch (error) {
        console.error("Error fetching GA4 realtime metrics:", error);
        return null;
    }
};

export const getTopPages = async (limit = 5): Promise<TopPage[] | null> => {
    if (!client || !propertyId) return null;

    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
            dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
            metrics: [{ name: "screenPageViews" }],
            limit,
            orderBys: [{ desc: true, metric: { metricName: "screenPageViews" } }],
        });

        return (response.rows || []).map((row) => ({
            path: row.dimensionValues?.[0]?.value || "",
            title: row.dimensionValues?.[1]?.value || "(not set)",
            views: parseInt(row.metricValues?.[0]?.value || "0", 10),
        }));
    } catch (error) {
        console.error("Error fetching GA4 top pages:", error);
        return null;
    }
};

export interface OverviewMetrics {
    sessions: number;
    totalUsers: number;
    screenPageViews: number;
    averageSessionDuration: number;
}

export const getOverviewMetrics = async (): Promise<OverviewMetrics | null> => {
    if (!client || !propertyId) return null;

    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
            metrics: [
                { name: "sessions" },
                { name: "totalUsers" },
                { name: "screenPageViews" },
                { name: "averageSessionDuration" },
            ],
        });

        const row = response.rows?.[0];
        if (!row) return null;

        return {
            sessions: parseInt(row.metricValues?.[0]?.value || "0", 10),
            totalUsers: parseInt(row.metricValues?.[1]?.value || "0", 10),
            screenPageViews: parseInt(row.metricValues?.[2]?.value || "0", 10),
            averageSessionDuration: parseFloat(row.metricValues?.[3]?.value || "0"),
        };
    } catch (error) {
        console.error("Error fetching GA4 overview metrics:", error);
        return null;
    }
};
