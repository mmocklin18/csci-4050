const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface BackendMovie {
    movie_id: number;
    name: string;
    description?: string | null;
    rating?: string | null;
    runtime?: number | null;
    release_date?: string | null;
    available?: boolean | null;
    poster?: string | null;
    trailer?: string | null;
    theater?: string | null;
    main_genre?: string | null;
}

export async function fetchMovies(): Promise<BackendMovie[]> {
    const res = await fetch(`${API}/api/movies`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch movies");
    return res.json();
}
