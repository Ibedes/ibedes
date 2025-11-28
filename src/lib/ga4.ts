import { BetaAnalyticsDataClient } from "@google-analytics/data";

const propertyId = import.meta.env.GA4_PROPERTY_ID;
const serviceAccountPath = import.meta.env.GA4_SERVICE_ACCOUNT_PATH;

const clampDays = (days: number) => {
    if (!Number.isFinite(days)) return 7;
    return Math.min(Math.max(Math.floor(days), 1), 30);
};

const buildStartDate = (days: number) => {
    const sanitized = clampDays(days);
    return sanitized > 1 ? `${sanitized - 1}daysAgo` : "today";
};

const formatGaDate = (value: string) => {
    if (!value || value.length !== 8) {
        return {
            iso: value,
            label: value,
        };
    }

    const year = value.slice(0, 4);
    const month = value.slice(4, 6);
    const day = value.slice(6, 8);
    const iso = `${year}-${month}-${day}`;
    const label = new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });

    return { iso, label };
};

const parsePercentMetric = (value?: string | null) => {
    const raw = Number.parseFloat(value || "0");
    if (!Number.isFinite(raw)) return 0;
    return raw > 1 ? raw : raw * 100;
};

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

export interface PageViewsTrendPoint {
    date: string;
    label: string;
    pageViews: number;
}

export interface DeviceBreakdownEntry {
    count: number;
    percent: number;
}

export interface DeviceBreakdown {
    total: number;
    breakdown: {
        mobile: DeviceBreakdownEntry;
        desktop: DeviceBreakdownEntry;
        tablet: DeviceBreakdownEntry;
        other: DeviceBreakdownEntry;
    };
}

export const getRealtimeMetrics = async (): Promise<RealtimeMetrics | null> => {
    if (!client || !propertyId) {
        console.warn("GA4 client or property ID not configured");
        return null;
    }

    try {
        const [response] = await client.runRealtimeReport({
            property: `properties/${propertyId}`,
            metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
            minuteRanges: [{ name: "0-29 minutes ago", startMinutesAgo: 29, endMinutesAgo: 0 }],
        });

        const activeUsers = parseInt(response.rows?.[0]?.metricValues?.[0]?.value || "0", 10);
        const screenPageViews = parseInt(response.rows?.[0]?.metricValues?.[1]?.value || "0", 10);

        return { activeUsers, screenPageViews };
    } catch (error: any) {
        console.error("Error fetching GA4 realtime metrics:", error);
        
        // Log specific error types for debugging
        if (error.code === 7) {
            console.error("GA4 PERMISSION_DENIED: The service account needs access to the GA4 property");
        }
        
        return null;
    }
};

export const getTopPages = async (limit = 5): Promise<TopPage[] | null> => {
    if (!client || !propertyId) {
        console.warn("GA4 client or property ID not configured");
        return null;
    }

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
    } catch (error: any) {
        console.error("Error fetching GA4 top pages:", error);
        
        if (error.code === 7) {
            console.error("GA4 PERMISSION_DENIED: The service account needs access to the GA4 property");
        }
        
        return null;
    }
};

export interface OverviewMetrics {
    sessions: number;
    totalUsers: number;
    screenPageViews: number;
    averageSessionDuration: number;
}

export interface PerformanceOverview {
    engagementRate: number;
    bounceRate: number;
    averageSessionDuration: number;
    conversionRate: number;
}

export const getOverviewMetrics = async (): Promise<OverviewMetrics | null> => {
    if (!client || !propertyId) {
        console.warn("GA4 client or property ID not configured");
        return null;
    }

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
    } catch (error: any) {
        console.error("Error fetching GA4 overview metrics:", error);
        
        if (error.code === 7) {
            console.error("GA4 PERMISSION_DENIED: The service account needs access to the GA4 property");
        }
        
        return null;
    }
};

export const getPageViewsTrend = async (
    days = 7,
): Promise<PageViewsTrendPoint[] | null> => {
    if (!client || !propertyId) {
        console.warn("GA4 client or property ID not configured");
        return null;
    }

    try {
        const startDate = buildStartDate(days);
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate: "today" }],
            dimensions: [{ name: "date" }],
            metrics: [{ name: "screenPageViews" }],
            orderBys: [{ dimension: { dimensionName: "date" } }],
        });

        return (response.rows || []).map((row) => {
            const rawDate = row.dimensionValues?.[0]?.value || "";
            const { iso, label } = formatGaDate(rawDate);
            return {
                date: iso,
                label,
                pageViews: parseInt(row.metricValues?.[0]?.value || "0", 10),
            };
        });
    } catch (error: any) {
        console.error("Error fetching GA4 page views trend:", error);

        if (error.code === 7) {
            console.error(
                "GA4 PERMISSION_DENIED: The service account needs access to the GA4 property",
            );
        }

        return null;
    }
};

export const getDeviceBreakdown = async (
    days = 7,
): Promise<DeviceBreakdown | null> => {
    if (!client || !propertyId) {
        console.warn("GA4 client or property ID not configured");
        return null;
    }

    try {
        const startDate = buildStartDate(days);
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate: "today" }],
            dimensions: [{ name: "deviceCategory" }],
            metrics: [{ name: "screenPageViews" }],
        });

        const breakdown: DeviceBreakdown["breakdown"] = {
            mobile: { count: 0, percent: 0 },
            desktop: { count: 0, percent: 0 },
            tablet: { count: 0, percent: 0 },
            other: { count: 0, percent: 0 },
        };

        let total = 0;

        (response.rows || []).forEach((row) => {
            const device = row.dimensionValues?.[0]?.value?.toLowerCase() || "other";
            const value = parseInt(row.metricValues?.[0]?.value || "0", 10);
            total += value;

            if (device in breakdown) {
                breakdown[device as keyof typeof breakdown].count += value;
            } else {
                breakdown.other.count += value;
            }
        });

        if (total > 0) {
            (Object.keys(breakdown) as Array<keyof typeof breakdown>).forEach((key) => {
                breakdown[key].percent = Number(
                    ((breakdown[key].count / total) * 100).toFixed(1),
                );
            });
        }

        return { total, breakdown };
    } catch (error: any) {
        console.error("Error fetching GA4 device breakdown:", error);

        if (error.code === 7) {
            console.error(
                "GA4 PERMISSION_DENIED: The service account needs access to the GA4 property",
            );
        }

        return null;
    }
};

export const getPerformanceOverview = async (
    days = 7,
): Promise<PerformanceOverview | null> => {
    if (!client || !propertyId) {
        console.warn("GA4 client or property ID not configured");
        return null;
    }

    try {
        const startDate = buildStartDate(days);
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate: "today" }],
            metrics: [
                { name: "engagementRate" },
                { name: "bounceRate" },
                { name: "averageSessionDuration" },
                { name: "sessionConversionRate" },
            ],
        });

        const row = response.rows?.[0];
        if (!row) return null;

        return {
            engagementRate: Number(parsePercentMetric(row.metricValues?.[0]?.value).toFixed(1)),
            bounceRate: Number(parsePercentMetric(row.metricValues?.[1]?.value).toFixed(1)),
            averageSessionDuration: parseFloat(row.metricValues?.[2]?.value || "0"),
            conversionRate: Number(parsePercentMetric(row.metricValues?.[3]?.value).toFixed(1)),
        };
    } catch (error: any) {
        console.error("Error fetching GA4 performance metrics:", error);

        if (error.code === 7) {
            console.error(
                "GA4 PERMISSION_DENIED: The service account needs access to the GA4 property",
            );
        }

        return null;
    }
};
