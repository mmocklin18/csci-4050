// src/app/api/promotions/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE =
    process.env.API_BASE_URL ||
    process.env.API_BASE ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "";

export const dynamic = "force-dynamic";

type ApiPromotion = {
    promotions_id: number;
    code: string;
    discount: number;        // percentage (10, 15, 100, etc.)
    start_date: string | null;
    end_date: string | null;
};

export async function GET(req: NextRequest) {
    if (!API_BASE) {
        return NextResponse.json(
            { error: "API_BASE not set" },
            { status: 500 }
        );
    }

    const code = req.nextUrl.searchParams.get("code"); // optional

    const url = `${API_BASE}/admin/promotions`;

    try {
        const res = await fetch(url, {
            cache: "no-store",
            headers: { accept: "application/json" },
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { error: "Upstream error", detail: data },
                { status: res.status }
            );
        }

        let promos = data as ApiPromotion[];

        // If a code is provided, filter and also check date range.
        if (code) {
            const now = new Date();

            promos = promos.filter((p) => {
                if (!p.code) return false;

                const matchesCode =
                    p.code.toUpperCase() === code.toUpperCase();

                let inDateRange = true;

                if (p.start_date) {
                    const start = new Date(p.start_date);
                    if (start > now) inDateRange = false;
                }
                if (p.end_date) {
                    const end = new Date(p.end_date);
                    if (end < now) inDateRange = false;
                }

                return matchesCode && inDateRange;
            });
        }

        return NextResponse.json(promos);
    } catch (err: any) {
        return NextResponse.json(
            { error: "Proxy error", detail: String(err) },
            { status: 500 }
        );
    }
}
