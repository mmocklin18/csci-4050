import { NextRequest, NextResponse } from "next/server";

const API_BASE =
    process.env.API_BASE_URL ||
    process.env.API_BASE ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
    if (!API_BASE) {
        return NextResponse.json(
            { error: "API_BASE not set" },
            { status: 500 }
        );
    }

    const url = `${API_BASE}/prices`; // hits FastAPI GET /prices/

    try {
        const res = await fetch(url, {
            cache: "no-store",
            headers: { accept: "application/json" },
        });

        const text = await res.text();

        if (!res.ok) {
            // So you can see errors clearly in the browser
            return NextResponse.json(
                { error: "Upstream error", detail: text },
                { status: res.status }
            );
        }

        // Just pass the JSON from the backend through
        return new NextResponse(text, {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: "Fetch to backend failed", detail: String(err) },
            { status: 500 }
        );
    }
}
