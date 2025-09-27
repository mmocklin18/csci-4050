import { NextResponse, NextRequest } from "next/server";

const API_BASE = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || "";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    if (!API_BASE) {
        return NextResponse.json({ error: "API_BASE not set" }, { status: 500 });
    }

    const id = req.nextUrl.searchParams.get("id");
    // Always fetch the list, optionally filter by id
    const r = await fetch(`${API_BASE}/movies`, { cache: "no-store" });
    const list = await r.json();

    if (!id) return NextResponse.json(list, { status: r.status });

    const one = Array.isArray(list)
        ? list.find((m: any) => String(m.movie_id) === String(id))
        : undefined;

    if (!one) return NextResponse.json({ detail: "Not found" }, { status: 404 });
    return NextResponse.json(one, { status: 200 });
}