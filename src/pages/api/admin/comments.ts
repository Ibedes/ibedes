import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../../lib/supabase";

export const prerender = false;

const ensureClient = () => {
    if (!supabaseAdmin) throw new Error("Supabase belum dikonfigurasi");
    return supabaseAdmin;
};

const parsePagination = (url: URL) => {
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 20)));
    return { page, limit, from: (page - 1) * limit, to: (page - 1) * limit + limit - 1 };
};

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const status = url.searchParams.get("status") || "pending";
        const search = url.searchParams.get("q")?.trim() || "";
        const { page, limit, from, to } = parsePagination(url);

        const supabase = ensureClient();
        let query = supabase
            .from("article_comments")
            .select("id, slug, article_slug, name, email, message, status, created_at", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(from, to);

        if (status !== "all") query = query.eq("status", status);
        if (search) {
            query = query.or(
                [
                    `message.ilike.%${search}%`,
                    `name.ilike.%${search}%`,
                    `email.ilike.%${search}%`,
                    `slug.ilike.%${search}%`,
                    `article_slug.ilike.%${search}%`,
                ].join(","),
            );
        }

        const { data, error, count } = await query;
        if (error) throw error;
        return new Response(JSON.stringify({ data, count, page, limit }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err: any) {
        console.error("[Comments API] GET error", err);
        return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { id, status } = body;
        if (!id || !status)
            return new Response(JSON.stringify({ error: "id dan status wajib" }), { status: 400 });

        const supabase = ensureClient();
        const { error } = await supabase.from("article_comments").update({ status }).eq("id", id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err: any) {
        console.error("[Comments API] POST error", err);
        return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { id } = body;
        if (!id) return new Response(JSON.stringify({ error: "id wajib" }), { status: 400 });

        const supabase = ensureClient();
        const { error } = await supabase.from("article_comments").delete().eq("id", id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err: any) {
        console.error("[Comments API] DELETE error", err);
        return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: 500 });
    }
};
