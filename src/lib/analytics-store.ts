import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface AnalyticsEventInput {
    event: string;
    category?: string;
    action?: string;
    label?: string;
    value?: number;
    page_path?: string;
    page_title?: string;
    session_id?: string;
    visitor_id?: string;
    referrer?: string;
    locale?: string;
    timezone?: string;
    screen?: string;
    device?: string;
    metadata?: Record<string, any> | null;
    url?: string;
    source?: string;
    timestamp?: number;
}

export interface StoredAnalyticsEvent extends AnalyticsEventInput {
    id?: string;
    created_at: string;
    event: string;
}

export interface RealtimeSnapshot {
    activeUsers: number;
    pageViews: number;
    topPages: Array<{ path: string; title?: string; views: number }>;
    timestamp: number;
}

export interface OverviewSummary {
    sessions: number;
    totalUsers: number;
    pageViews: number;
    averageSessionDuration: number;
    timestamp: number;
}

export interface DeviceBreakdownEntry {
    count: number;
    percent: number;
}

export interface DeviceBreakdownSummary {
    total: number;
    breakdown: {
        mobile: DeviceBreakdownEntry;
        desktop: DeviceBreakdownEntry;
        tablet: DeviceBreakdownEntry;
        other: DeviceBreakdownEntry;
    };
}

export interface PerformanceOverviewSummary {
    engagementRate: number;
    bounceRate: number;
    averageSessionDuration: number;
    conversionRate: number;
}

interface SupabaseAnalyticsRow {
    id?: string;
    created_at: string;
    event_name: string;
    event_category?: string | null;
    event_action?: string | null;
    event_label?: string | null;
    event_value?: number | null;
    page_path?: string | null;
    page_title?: string | null;
    session_id?: string | null;
    visitor_id?: string | null;
    referrer?: string | null;
    locale?: string | null;
    timezone?: string | null;
    screen?: string | null;
    device?: string | null;
    url?: string | null;
    source?: string | null;
    metadata?: Record<string, any> | null;
}

const supabaseUrl =
    import.meta.env.SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    import.meta.env.PUBLIC_SUPABASE_URL ??
    process.env.PUBLIC_SUPABASE_URL ??
    "";

const supabaseServiceKey =
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    import.meta.env.SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ??
    process.env.PUBLIC_SUPABASE_ANON_KEY ??
    "";

const SUPABASE_TABLE = "analytics_events";
const FALLBACK_CACHE_LIMIT = 2000;

let supabaseClient: SupabaseClient | null = null;
const fallbackEvents: StoredAnalyticsEvent[] = [];

const getSupabaseClient = () => {
    if (!supabaseUrl || !supabaseServiceKey) return null;
    if (!supabaseClient) {
        supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false },
        });
    }
    return supabaseClient;
};

const inferDeviceCategory = (userAgent?: string | null) => {
    const value = userAgent?.toLowerCase() ?? "";
    if (!value) return "desktop";
    if (/ipad|tablet/.test(value)) return "tablet";
    if (/mobile|iphone|android/.test(value)) return "mobile";
    return "desktop";
};

const getClientIp = (request: Request) => {
    const forwarded =
        request.headers.get("x-forwarded-for") ??
        request.headers.get("x-real-ip") ??
        request.headers.get("cf-connecting-ip");
    if (!forwarded) return undefined;
    return forwarded.split(",")[0]?.trim();
};

const pushFallbackEvent = (event: StoredAnalyticsEvent) => {
    fallbackEvents.unshift(event);
    if (fallbackEvents.length > FALLBACK_CACHE_LIMIT) {
        fallbackEvents.pop();
    }
};

const normalizeStoredEvent = (row: SupabaseAnalyticsRow): StoredAnalyticsEvent => ({
    id: row.id,
    created_at: row.created_at,
    event: row.event_name,
    category: row.event_category ?? undefined,
    action: row.event_action ?? undefined,
    label: row.event_label ?? undefined,
    value: typeof row.event_value === "number" ? row.event_value : undefined,
    page_path: row.page_path ?? undefined,
    page_title: row.page_title ?? undefined,
    session_id: row.session_id ?? undefined,
    visitor_id: row.visitor_id ?? undefined,
    referrer: row.referrer ?? undefined,
    locale: row.locale ?? undefined,
    timezone: row.timezone ?? undefined,
    screen: row.screen ?? undefined,
    device: row.device ?? undefined,
    url: row.url ?? undefined,
    source: row.source ?? undefined,
    metadata: row.metadata ?? undefined,
});

const getFallbackEvents = (since?: Date) => {
    if (!since) return [...fallbackEvents];
    const sinceMs = since.getTime();
    return fallbackEvents.filter((event) =>
        new Date(event.created_at).getTime() >= sinceMs,
    );
};

const fetchEvents = async (since?: Date, limit = 2000) => {
    const client = getSupabaseClient();
    if (!client) {
        return getFallbackEvents(since);
    }

    let query = client
        .from(SUPABASE_TABLE)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (since) {
        query = query.gte("created_at", since.toISOString());
    }

    const { data, error } = await query;

    if (error) {
        console.error("[Analytics] Failed to fetch events:", error.message);
        return getFallbackEvents(since);
    }

    return (data ?? []).map(normalizeStoredEvent);
};

const ensureIsoDate = (value?: number | string) => {
    if (typeof value === "number") {
        return new Date(value).toISOString();
    }
    if (typeof value === "string") {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) return date.toISOString();
    }
    return new Date().toISOString();
};

export const collectAnalyticsEvent = async (
    payload: AnalyticsEventInput,
    request: Request,
) => {
    const eventName = (payload.event || "custom_event").toString().slice(0, 80);
    const userAgent = request.headers.get("user-agent") ?? "";
    const device = payload.device ?? inferDeviceCategory(userAgent);
    const createdAt = ensureIsoDate(payload.timestamp);
    const rawMetadata = { ...(payload.metadata ?? {}) };
    const ipAddress = getClientIp(request);
    if (ipAddress) rawMetadata.ip = ipAddress;
    if (userAgent) rawMetadata.user_agent = userAgent;

    const sanitized: StoredAnalyticsEvent = {
        ...payload,
        event: eventName,
        session_id: payload.session_id?.slice(0, 64),
        visitor_id: payload.visitor_id?.slice(0, 64),
        page_path: payload.page_path?.slice(0, 255),
        page_title: payload.page_title?.slice(0, 255),
        referrer: payload.referrer?.slice(0, 255),
        locale: payload.locale?.slice(0, 32),
        timezone: payload.timezone?.slice(0, 64),
        screen: payload.screen?.slice(0, 32),
        device,
        created_at: createdAt,
        metadata:
            Object.keys(rawMetadata).length > 0 ? rawMetadata : payload.metadata ?? null,
        source: payload.source ?? "web",
    };

    const client = getSupabaseClient();
    if (client) {
        const { error } = await client.from(SUPABASE_TABLE).insert({
            event_name: sanitized.event,
            event_category: sanitized.category ?? null,
            event_action: sanitized.action ?? null,
            event_label: sanitized.label ?? null,
            event_value: sanitized.value ?? null,
            page_path: sanitized.page_path ?? null,
            page_title: sanitized.page_title ?? null,
            session_id: sanitized.session_id ?? null,
            visitor_id: sanitized.visitor_id ?? null,
            referrer: sanitized.referrer ?? null,
            locale: sanitized.locale ?? null,
            timezone: sanitized.timezone ?? null,
            screen: sanitized.screen ?? null,
            device: sanitized.device ?? null,
            url: sanitized.url ?? null,
            source: sanitized.source ?? null,
            metadata: sanitized.metadata ?? null,
            created_at: sanitized.created_at,
        } as Record<string, unknown>);

        if (error) {
            console.error("[Analytics] Failed to store event:", error.message);
        }
    }

    pushFallbackEvent(sanitized);
    return sanitized;
};

const groupSessions = (events: StoredAnalyticsEvent[]) => {
    const sessions = new Map<
        string,
        {
            events: StoredAnalyticsEvent[];
            first: number;
            last: number;
            conversions: number;
        }
    >();

    const conversionEvents = new Set(["affiliate_click", "newsletter_subscribe"]);

    events.forEach((event) => {
        const key = event.session_id || event.visitor_id || event.created_at;
        if (!key) return;
        const time = new Date(event.created_at).getTime();
        const entry = sessions.get(key) ?? {
            events: [],
            first: time,
            last: time,
            conversions: 0,
        };
        entry.events.push(event);
        entry.first = Math.min(entry.first, time);
        entry.last = Math.max(entry.last, time);
        if (conversionEvents.has(event.event)) {
            entry.conversions += 1;
        }
        sessions.set(key, entry);
    });

    return sessions;
};

const summarizeSessions = (events: StoredAnalyticsEvent[]) => {
    const sessions = groupSessions(events);
    const totalSessions = sessions.size || 1;
    let totalDuration = 0;
    let engagedSessions = 0;
    let conversionSessions = 0;

    sessions.forEach((session) => {
        const duration = Math.max(0, session.last - session.first) / 1000;
        totalDuration += duration;
        if (session.events.length > 1) {
            engagedSessions += 1;
        }
        if (session.conversions > 0) {
            conversionSessions += 1;
        }
    });

    return {
        totalSessions,
        averageDuration: totalDuration / totalSessions,
        engagementRate: (engagedSessions / totalSessions) * 100,
        conversionRate: (conversionSessions / totalSessions) * 100,
    };
};

export const getRealtimeSnapshot = async (
    minutes = 30,
): Promise<RealtimeSnapshot> => {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    const events = await fetchEvents(since, 2000);
    const pageViews = events.filter((event) => event.event === "page_view").length;
    const activeUsers = new Set(
        events.map((event) => event.session_id || event.visitor_id).filter(Boolean),
    ).size;

    const pageCounts = new Map<string, { views: number; title?: string }>();
    events
        .filter((event) => event.event === "page_view")
        .forEach((event) => {
            const key = event.page_path || event.url || "unknown";
            const entry = pageCounts.get(key) ?? { views: 0, title: event.page_title };
            entry.views += 1;
            if (event.page_title) entry.title = event.page_title;
            pageCounts.set(key, entry);
        });

    const topPages = Array.from(pageCounts.entries())
        .map(([path, value]) => ({ path, title: value.title, views: value.views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

    return {
        activeUsers,
        pageViews,
        topPages,
        timestamp: Date.now(),
    };
};

export const getTopPages = async (days = 7, limit = 8) => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const events = await fetchEvents(since, 5000);

    const counts = new Map<string, { views: number; title?: string }>();
    events
        .filter((event) => event.event === "page_view")
        .forEach((event) => {
            const key = event.page_path || event.url || "unknown";
            const entry = counts.get(key) ?? { views: 0, title: event.page_title };
            entry.views += 1;
            if (event.page_title) entry.title = event.page_title;
            counts.set(key, entry);
        });

    return Array.from(counts.entries())
        .map(([path, info]) => ({ path, title: info.title, views: info.views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
};

export const getOverviewMetricsFromEvents = async (
    days = 28,
): Promise<OverviewSummary> => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const events = await fetchEvents(since, 6000);
    const sessions = new Set(
        events.map((event) => event.session_id || event.visitor_id).filter(Boolean),
    ).size;
    const users = new Set(events.map((event) => event.visitor_id).filter(Boolean)).size;
    const pageViews = events.filter((event) => event.event === "page_view").length;
    const sessionSummary = summarizeSessions(events);

    return {
        sessions,
        totalUsers: users,
        pageViews,
        averageSessionDuration: Number(
            sessionSummary.averageDuration.toFixed(1),
        ),
        timestamp: Date.now(),
    };
};

export const getPageViewsTrend = async (days = 7) => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const events = await fetchEvents(since, 6000);
    const counts = new Map<string, number>();

    events
        .filter((event) => event.event === "page_view")
        .forEach((event) => {
            const date = event.created_at.slice(0, 10);
            counts.set(date, (counts.get(date) ?? 0) + 1);
        });

    const result = [] as Array<{ date: string; label: string; pageViews: number }>;
    for (let i = days - 1; i >= 0; i -= 1) {
        const current = new Date();
        current.setDate(current.getDate() - i);
        const iso = current.toISOString().slice(0, 10);
        const label = current.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
        result.push({ date: iso, label, pageViews: counts.get(iso) ?? 0 });
    }

    return result;
};

export const getDeviceBreakdown = async (
    days = 7,
): Promise<DeviceBreakdownSummary> => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const events = await fetchEvents(since, 4000);
    const deviceCounts: Record<string, number> = {
        mobile: 0,
        desktop: 0,
        tablet: 0,
        other: 0,
    };

    events.forEach((event) => {
        const key = (event.device ?? "other").toLowerCase();
        if (key in deviceCounts) {
            deviceCounts[key] += 1;
        } else {
            deviceCounts.other += 1;
        }
    });

    const total = Object.values(deviceCounts).reduce((sum, value) => sum + value, 0);

    const breakdown = Object.entries(deviceCounts).reduce(
        (acc, [key, count]) => {
            acc[key as keyof typeof acc] = {
                count,
                percent:
                    total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
            };
            return acc;
        },
        {
            mobile: { count: 0, percent: 0 },
            desktop: { count: 0, percent: 0 },
            tablet: { count: 0, percent: 0 },
            other: { count: 0, percent: 0 },
        } as DeviceBreakdownSummary["breakdown"],
    );

    return { total, breakdown };
};

export const getPerformanceOverview = async (
    days = 7,
): Promise<PerformanceOverviewSummary> => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const events = await fetchEvents(since, 6000);
    const sessionsSummary = summarizeSessions(events);

    const bounceRate = 100 - sessionsSummary.engagementRate;

    return {
        engagementRate: Number(sessionsSummary.engagementRate.toFixed(1)),
        bounceRate: Number(bounceRate.toFixed(1)),
        averageSessionDuration: Number(
            sessionsSummary.averageDuration.toFixed(1),
        ),
        conversionRate: Number(sessionsSummary.conversionRate.toFixed(1)),
    };
};

export const getConversionInsights = async (days = 7) => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const events = await fetchEvents(since, 4000);
    const sessions = summarizeSessions(events);

    const counts = events.reduce(
        (acc, event) => {
            if (event.event === "affiliate_click") acc.affiliateClicks += 1;
            if (event.event === "newsletter_subscribe") acc.newsletterSubscribes += 1;
            if (event.event === "engagement") acc.engagementEvents += 1;
            if (event.event === "error") acc.errorEvents += 1;
            return acc;
        },
        {
            affiliateClicks: 0,
            newsletterSubscribes: 0,
            engagementEvents: 0,
            errorEvents: 0,
        },
    );

    return {
        ...counts,
        conversionRate: Number(sessions.conversionRate.toFixed(1)),
        engagementRate: Number(sessions.engagementRate.toFixed(1)),
        totalSessions: sessions.totalSessions,
    };
};

const normalizeHostname = (referrer?: string) => {
    if (!referrer) return "Direct";
    try {
        const url = new URL(referrer);
        return url.hostname.replace(/^www\./, "");
    } catch {
        return referrer;
    }
};

export const getReferrerBreakdown = async (days = 7, limit = 6) => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const events = await fetchEvents(since, 4000);
    const referrerCounts = new Map<string, number>();

    events
        .filter((event) => event.event === "page_view")
        .forEach((event) => {
            const host = normalizeHostname(event.referrer);
            referrerCounts.set(host, (referrerCounts.get(host) ?? 0) + 1);
        });

    const sorted = Array.from(referrerCounts.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);

    return sorted.slice(0, limit);
};

export const getRecentEvents = async (limit = 20) => {
    const events = await fetchEvents(undefined, limit);
    return events
        .sort(
            (a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, limit)
        .map((event) => ({
            created_at: event.created_at,
            event: event.event,
            label: event.label,
            category: event.category,
            page_path: event.page_path,
            value: event.value,
        }));
};

export const getAffiliateClicksSummary = async (days = 30, limit = 20) => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const events = await fetchEvents(since, 6000);
    const clicks = events.filter((event) => event.event === "affiliate_click");

    const grouped = new Map<
        string,
        {
            productId: string;
            name: string;
            platform?: string;
            clicks: number;
        }
    >();

    clicks.forEach((event) => {
        const productId = (event.product_id || event.label || event.page_path || "unknown").toString();
        const name = (event.label || event.product_name || productId).toString();
        const platform = (event.platform || event.metadata?.platform || "") as string;
        const key = `${productId}:${name}:${platform}`;
        const entry = grouped.get(key) ?? {
            productId,
            name,
            platform,
            clicks: 0,
        };
        entry.clicks += 1;
        grouped.set(key, entry);
    });

    return Array.from(grouped.values())
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, limit);
};
