import { NextResponse, NextRequest } from "next/server";

const API_BASE =
  process.env.API_BASE_URL || process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || "";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!API_BASE) {
    return NextResponse.json({ error: "API_BASE not set" }, { status: 500 });
  }

  const movieId = req.nextUrl.searchParams.get("movie_id");
  const url = movieId
    ? `${API_BASE}/shows/movie/${encodeURIComponent(movieId)}`
    : `${API_BASE}/shows`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error", detail: text }, { status: res.status });
    }

    const payload = text ? JSON.parse(text) : null;
    return NextResponse.json(payload ?? [], { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Fetch failed", detail: message }, { status: 502 });
  }
}
