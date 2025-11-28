// Analytics and tracking utilities

export interface AnalyticsEvent {
    event: string;
    category?: string;
    action?: string;
    label?: string;
    value?: number;
    [key: string]: any;
}

const ANALYTICS_ENDPOINT = '/api/analytics/collect';
const VISITOR_STORAGE_KEY = 'ibedes:analytics:visitor';
const SESSION_STORAGE_KEY = 'ibedes:analytics:session';

const generateId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getVisitorId = () => {
    if (typeof window === 'undefined') return undefined;
    try {
        const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
        if (existing) return existing;
        const fresh = generateId();
        window.localStorage.setItem(VISITOR_STORAGE_KEY, fresh);
        return fresh;
    } catch {
        return undefined;
    }
};

const getSessionId = () => {
    if (typeof window === 'undefined') return undefined;
    try {
        const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (existing) return existing;
        const fresh = generateId();
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, fresh);
        return fresh;
    } catch {
        return undefined;
    }
};

const buildClientContext = () => {
    if (typeof window === 'undefined') return {};
    const visitorId = getVisitorId();
    const sessionId = getSessionId() || visitorId;

    const locale = typeof navigator !== 'undefined' ? navigator.language : undefined;
    const timezone = typeof Intl !== 'undefined'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : undefined;
    const screenSize = typeof window.screen !== 'undefined'
        ? `${window.screen.width}x${window.screen.height}`
        : undefined;

    return {
        session_id: sessionId,
        visitor_id: visitorId,
        locale,
        timezone,
        screen: screenSize,
        source: 'web',
    };
};

/**
 * Track affiliate link clicks
 */
export function trackAffiliateClick(
    productId: string,
    platform: string,
    productName: string,
    price: string
) {
    if (typeof window === 'undefined') return;

    const event: AnalyticsEvent = {
        event: 'affiliate_click',
        category: 'Affiliate',
        action: 'Click',
        label: productName,
        product_id: productId,
        platform: platform,
        price: price,
        value: 1,
    };

    // Google Analytics 4
    if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'affiliate_click', {
            product_id: productId,
            platform: platform,
            product_name: productName,
            price: price,
        });
    }

    // Custom analytics endpoint (if you have one)
    sendToAnalytics(event);
}

/**
 * Track social share actions
 */
export function trackShare(platform: string, url: string, title: string) {
    if (typeof window === 'undefined') return;

    const event: AnalyticsEvent = {
        event: 'share',
        category: 'Social',
        action: 'Share',
        label: platform,
        url: url,
        title: title,
    };

    if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'share', {
            method: platform,
            content_type: 'article',
            item_id: url,
        });
    }

    sendToAnalytics(event);
}

/**
 * Track newsletter subscriptions
 */
export function trackNewsletterSubscribe(email: string) {
    if (typeof window === 'undefined') return;

    const event: AnalyticsEvent = {
        event: 'newsletter_subscribe',
        category: 'Newsletter',
        action: 'Subscribe',
        label: email,
    };

    if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'generate_lead', {
            currency: 'IDR',
            value: 0,
        });
    }

    sendToAnalytics(event);
}

/**
 * Track page views with additional metadata
 */
export function trackPageView(
    path: string,
    title: string,
    metadata?: Record<string, any>
) {
    if (typeof window === 'undefined') return;

    const event: AnalyticsEvent = {
        event: 'page_view',
        page_path: path,
        page_title: title,
        ...metadata,
    };

    if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'page_view', {
            page_title: title,
            page_path: path,
            ...metadata,
        });
    }

    sendToAnalytics(event);
}

/**
 * Track user engagement (time on page, scroll depth, etc.)
 */
export function trackEngagement(
    action: string,
    value: number,
    label?: string
) {
    if (typeof window === 'undefined') return;

    const event: AnalyticsEvent = {
        event: 'engagement',
        category: 'Engagement',
        action: action,
        label: label,
        value: value,
    };

    if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'engagement', {
            engagement_type: action,
            value: value,
            label: label,
        });
    }

    sendToAnalytics(event);
}

/**
 * Track errors
 */
export function trackError(
    error: Error | string,
    context?: string
) {
    if (typeof window === 'undefined') return;

    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    const event: AnalyticsEvent = {
        event: 'error',
        category: 'Error',
        action: context || 'Unknown',
        label: errorMessage,
        error_stack: errorStack,
    };

    if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'exception', {
            description: errorMessage,
            fatal: false,
        });
    }

    sendToAnalytics(event);
}

/**
 * Send event to custom analytics endpoint
 */
function sendToAnalytics(event: AnalyticsEvent) {
    if (typeof window === 'undefined') return;
    if (!event || typeof event.event !== 'string') return;

    const context = buildClientContext();
    const payload = {
        ...event,
        ...context,
        page_path: event.page_path ?? window.location.pathname,
        page_title: event.page_title ?? document.title,
        referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
        url: window.location.href,
        timestamp: Date.now(),
    };

    if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', payload);
    }

    const body = JSON.stringify(payload);
    const canBeacon = typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function';

    if (canBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        const queued = navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
        if (queued) return;
    }

    fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
    }).catch((error) => {
        if (process.env.NODE_ENV === 'development') {
            console.error('[Analytics] Failed to send event', error);
        }
    });
}

/**
 * Initialize scroll depth tracking
 */
export function initScrollTracking() {
    if (typeof window === 'undefined') return;

    let maxScroll = 0;
    const milestones = [25, 50, 75, 100];
    const tracked = new Set<number>();

    function handleScroll() {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );

        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;

            milestones.forEach((milestone) => {
                if (scrollPercent >= milestone && !tracked.has(milestone)) {
                    tracked.add(milestone);
                    trackEngagement('scroll_depth', milestone, `${milestone}%`);
                }
            });
        }
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
}

/**
 * Initialize time on page tracking
 */
export function initTimeTracking() {
    if (typeof window === 'undefined') return;

    const startTime = Date.now();
    const intervals = [30, 60, 120, 300]; // seconds
    const tracked = new Set<number>();

    setInterval(() => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);

        intervals.forEach((interval) => {
            if (timeSpent >= interval && !tracked.has(interval)) {
                tracked.add(interval);
                trackEngagement('time_on_page', interval, `${interval}s`);
            }
        });
    }, 10000); // Check every 10 seconds
}

/**
 * Make tracking functions globally available
 */
if (typeof window !== 'undefined') {
    (window as any).trackAffiliateClick = trackAffiliateClick;
    (window as any).trackShare = trackShare;
    (window as any).trackNewsletterSubscribe = trackNewsletterSubscribe;
    (window as any).trackPageView = trackPageView;
    (window as any).trackEngagement = trackEngagement;
    (window as any).trackError = trackError;
}
