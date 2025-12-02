import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const since = url.searchParams.get("since");
        const sinceTimestamp = since ? parseInt(since, 10) : Date.now() - 86400000; // Default: last 24 hours

        if (!supabaseUrl || !supabaseKey) {
            return new Response(
                JSON.stringify({
                    subscriptions: [],
                    total: 0,
                    new: [],
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Query subscription events from analytics
        const { data, error } = await supabase
            .from("analytics_events")
            .select("*")
            .eq("event", "newsletter_subscribe")
            .gte("created_at", new Date(sinceTimestamp).toISOString())
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) {
            console.error("Error fetching subscriptions:", error);
            return new Response(
                JSON.stringify({
                    subscriptions: [],
                    total: 0,
                    new: [],
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const subscriptions = (data || []).map((event: any) => ({
            email: event.label || "unknown",
            timestamp: event.created_at,
            page: event.page_path,
            id: event.id,
        }));

        // Determine which are "new" since last check
        const newSubscriptions = subscriptions.filter((sub: any) => {
            const subTime = new Date(sub.timestamp).getTime();
            return subTime > sinceTimestamp;
        });

        return new Response(
            JSON.stringify({
                subscriptions,
                total: subscriptions.length,
                new: newSubscriptions,
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error in subscriptions API:", error);
        return new Response(
            JSON.stringify({
                error: "Failed to fetch subscriptions",
                subscriptions: [],
                total: 0,
                new: [],
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
};
