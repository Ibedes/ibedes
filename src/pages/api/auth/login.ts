import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        let body: any = null;
        try {
            body = await request.json();
        } catch {
            return new Response(
                JSON.stringify({ error: "Empty or invalid JSON body" }),
                { status: 400 },
            );
        }

        const { username, password } = body || {};

        // Allow local dev fallback so endpoint tidak 500 ketika env belum di-set.
        const adminUser =
            import.meta.env.ADMIN_USER ||
            process.env.ADMIN_USER ||
            (import.meta.env.DEV ? "admin" : undefined);
        const adminPassword =
            import.meta.env.ADMIN_PASSWORD ||
            process.env.ADMIN_PASSWORD ||
            (import.meta.env.DEV ? "admin123" : undefined);

        if (!adminUser || !adminPassword) {
            return new Response(
                JSON.stringify({ error: "Server configuration error" }),
                { status: 500 }
            );
        }

        if (username === adminUser && password === adminPassword) {
            // Set session cookie
            // In a real app, use a secure token or JWT
            cookies.set("admin_session", "authenticated", {
                path: "/",
                httpOnly: true,
                secure: import.meta.env.PROD,
                maxAge: 60 * 60 * 24 * 7, // 1 week
                sameSite: "strict",
            });

            return new Response(
                JSON.stringify({ success: true }),
                { status: 200 }
            );
        } else {
            return new Response(
                JSON.stringify({ error: "Invalid credentials" }),
                { status: 401 }
            );
        }
    } catch (error) {
        console.error("Login error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500 }
        );
    }
};
