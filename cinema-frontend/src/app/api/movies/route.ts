import { NextResponse, NextRequest } from "next/server";

const API_BASE =
    process.env.API_BASE_URL || process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || "";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    if (!API_BASE) {
        return NextResponse.json({ error: "API_BASE not set" }, { status: 500 });
    }

    const id = req.nextUrl.searchParams.get("id");

    const urls = id
        ? [
            `${API_BASE}/movies?id=${encodeURIComponent(id)}`,
            `${API_BASE}/movies/${encodeURIComponent(id)}`,
        ]
        : [`${API_BASE}/movies`];

    try {
        for (const url of urls) {
            const res = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } });
            const text = await res.text();

            if (!res.ok) {
                if (id && url.includes("?id=")) continue;
                return NextResponse.json({ error: "Upstream error", detail: text }, { status: res.status });
            }

            const json = text ? JSON.parse(text) : null;

            let payload: unknown;
            if (id) {
                if (Array.isArray(json)) {
                    payload =
                        json.find(
                            (m: any) => String(m?.movie_id ?? m?.id) === String(id)
                        ) ?? null;
                } else {
                    const got = String((json as any)?.movie_id ?? (json as any)?.id ?? "");
                    payload = got && got !== String(id) ? null : json;
                }

                if (!payload) {
                    continue;
                }
            } else {
                payload = json;
            }

            return NextResponse.json(payload, { status: 200 });
        }

        return NextResponse.json({ detail: "Not found" }, { status: 404 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: "Fetch failed", detail: message }, { status: 502 });
    }
}