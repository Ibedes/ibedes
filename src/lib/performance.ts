// Performance monitoring utilities

export interface PerformanceMetrics {
    FCP?: number; // First Contentful Paint
    LCP?: number; // Largest Contentful Paint
    FID?: number; // First Input Delay
    CLS?: number; // Cumulative Layout Shift
    TTFB?: number; // Time to First Byte
    INP?: number; // Interaction to Next Paint
}

/**
 * Initialize Web Vitals monitoring
 */
export function initPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Use Web Vitals library if available
    if ('PerformanceObserver' in window) {
        // Monitor Largest Contentful Paint (LCP)
        observeLCP();

        // Monitor First Input Delay (FID)
        observeFID();

        // Monitor Cumulative Layout Shift (CLS)
        observeCLS();

        // Monitor Time to First Byte (TTFB)
        observeTTFB();
    }

    // Monitor page load time
    window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

        reportMetric('page_load_time', pageLoadTime);
    });
}

/**
 * Observe Largest Contentful Paint
 */
function observeLCP() {
    try {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];

            reportMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
        });

        observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
        console.warn('LCP observation failed:', e);
    }
}

/**
 * Observe First Input Delay
 */
function observeFID() {
    try {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
                reportMetric('FID', entry.processingStart - entry.startTime);
            });
        });

        observer.observe({ type: 'first-input', buffered: true });
    } catch (e) {
        console.warn('FID observation failed:', e);
    }
}

/**
 * Observe Cumulative Layout Shift
 */
function observeCLS() {
    try {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!(entry as any).hadRecentInput) {
                    clsValue += (entry as any).value;
                }
            }

            reportMetric('CLS', clsValue);
        });

        observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
        console.warn('CLS observation failed:', e);
    }
}

/**
 * Observe Time to First Byte
 */
function observeTTFB() {
    try {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
                reportMetric('TTFB', entry.responseStart - entry.requestStart);
            });
        });

        observer.observe({ type: 'navigation', buffered: true });
    } catch (e) {
        console.warn('TTFB observation failed:', e);
    }
}

/**
 * Report metric to analytics
 */
function reportMetric(name: string, value: number) {
    // Send to Google Analytics
    if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: name,
            value: Math.round(value),
            non_interaction: true,
        });
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}:`, Math.round(value), 'ms');
    }

    // Send to custom endpoint if needed
    // sendToAnalyticsEndpoint({ metric: name, value });
}

/**
 * Monitor resource loading
 */
export function monitorResourceLoading() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
        const resources = performance.getEntriesByType('resource');

        // Group by resource type
        const resourceStats: Record<string, { count: number; totalSize: number; totalDuration: number }> = {};

        resources.forEach((resource: any) => {
            const type = resource.initiatorType || 'other';

            if (!resourceStats[type]) {
                resourceStats[type] = { count: 0, totalSize: 0, totalDuration: 0 };
            }

            resourceStats[type].count++;
            resourceStats[type].totalSize += resource.transferSize || 0;
            resourceStats[type].totalDuration += resource.duration || 0;
        });

        // Report stats
        Object.entries(resourceStats).forEach(([type, stats]) => {
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Resources] ${type}:`, {
                    count: stats.count,
                    totalSize: `${(stats.totalSize / 1024).toFixed(2)} KB`,
                    avgDuration: `${(stats.totalDuration / stats.count).toFixed(2)} ms`,
                });
            }
        });
    });
}

/**
 * Monitor long tasks
 */
export function monitorLongTasks() {
    if (typeof window === 'undefined') return;

    try {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                // Report tasks longer than 50ms
                if (entry.duration > 50) {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn('[Performance] Long task detected:', {
                            duration: `${entry.duration.toFixed(2)} ms`,
                            startTime: entry.startTime,
                        });
                    }

                    reportMetric('long_task', entry.duration);
                }
            }
        });

        observer.observe({ type: 'longtask', buffered: true });
    } catch (e) {
        // Long task API not supported
    }
}

/**
 * Initialize all performance monitoring
 */
export function initAllPerformanceMonitoring() {
    initPerformanceMonitoring();
    monitorResourceLoading();
    monitorLongTasks();
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    (window as any).initPerformanceMonitoring = initAllPerformanceMonitoring;
}
