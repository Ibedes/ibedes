import type { APIRoute } from "astro";
import { collectAnalyticsEvent } from "../../../lib/analytics-store";

export const prerender = false;

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
        },
    });

export const OPTIONS: APIRoute = async () =>
    new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });

export const POST: APIRoute = async ({ request }) => {
    try {
        const payload = await request.json();
        if (!payload || typeof payload !== "object") {
            return jsonResponse({ error: "Invalid payload" }, 400);
        }

        await collectAnalyticsEvent(payload, request);
        return jsonResponse({ success: true }, 201);
    } catch (error) {
        console.error("[Analytics] Collect endpoint error:", error);
        return jsonResponse({ error: "Failed to collect event" }, 500);
    }
};
