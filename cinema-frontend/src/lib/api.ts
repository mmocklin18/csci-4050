const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface BackendMovie {
    id: number;
    title: string;
    genre: string;
    rating: string;
    status: string;
    poster?: string;
    showtimes?: string[];
}

export async function fetchMovies(): Promise<BackendMovie[]> {
    const res = await fetch(`${API}/api/movies`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch movies");
    return res.json();
}