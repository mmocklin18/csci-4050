import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL;

export async function GET() {
    if (!API_BASE) {
        return NextResponse.json(
            { error: "Missing API_BASE_URL env var" },
            { status: 500 }
        );
    }
    const res = await fetch(`${API_BASE}/movies`, { cache: "no-store" });
    if (!res.ok) {
        return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
}
