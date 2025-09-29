//Specific movie details page with showtimes linking to booking page
"use client";
import React from "react";
import Link from "next/link";
import {useState, useEffect} from "react";
import { useParams } from "next/navigation";

// backend shape
type ApiMovie = {
    movie_id: number;
    name: string;
    description: string;
    rating: "G" | "PG" | "PG-13" | "R";
    runtime: number;
    release_date: string;     // ISO
    available: boolean;
    poster: string;
    trailer: string | null;
    theater: string | null;
    main_genre: string;
};

const DefaultShowtimes = ["12:00 PM", "3:00 PM", "6:00 PM", "9:00 PM"];

function toYouTubeEmbed(url?: string | null): string | undefined {
    if (!url) return undefined;
    try {
        const u = new URL(url);
        const host = u.hostname.replace(/^www\./, "");
        if (host === "youtu.be") {
            const id = u.pathname.slice(1);
            return id ? `https://www.youtube-nocookie.com/embed/${id}` : undefined;
        }
        if (host === "youtube.com" || host === "m.youtube.com") {
            const id = u.searchParams.get("v");
            if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
            const m = u.pathname.match(/\/embed\/([^/?#]+)/);
            if (m?.[1]) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
        }
    } catch {
    }
    return undefined;
}

type UiMovie = {
    id: string;
    title: string;
    rating: ApiMovie["rating"];
    description: string;
    posterUrl: string;
    trailerEmbedUrl?: string;
    showtimes: string[];
};

function mapApiToUi(m: ApiMovie) {
    return {
        id: String(m.movie_id),
        title: m.name,
        rating: m.rating,
        description: m.description,
        posterUrl: m.poster ?? "/placeholder.png",
        trailerEmbedUrl: toYouTubeEmbed(m.trailer),
        showtimes: DefaultShowtimes, // hardcode showtimes
    };
}

export default function MovieDetails() {
    const { id } = useParams<{ id: string }>();
    const [date, setDate] = useState("");
    const [movie, setMovie] = useState<ReturnType<typeof mapApiToUi> | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (date) localStorage.setItem("selectedDate", date);
    }, [date]);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                setLoading(true);
                const r = await fetch(`/api/movies?id=${encodeURIComponent(String(id))}`, { cache: "no-store" });
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const data: ApiMovie | null = await r.json();
                setMovie(data ? mapApiToUi(data) : null);
            } catch (err: unknown) {
                setErr(err instanceof Error ? err.message : "Failed to load movie");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <main className="p-6">Loading…</main>;
    if (err) return <main className="p-6 text-red-600">Error: {err}</main>;
    if (!movie) return <main className="p-6">Movie not found.</main>;

    return (
		<div style={{ backgroundColor: "#fff", top: 0, left: 0, right: 0, bottom: 0, margin: 0, padding: 0}}>
            <header className="navbar">
                <div className="brand">BookMyShow</div>
            </header>
			<div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "8px", padding: "20px"}}>
				<img src={movie.posterUrl} alt={movie.title} style={{ width: 200, borderRadius: 12, marginRight: "20px" }} />
				<div>
					<h1 style={{color: "black", fontSize: "40px", fontWeight: "bold"}}>{movie.title}</h1>
					<p style={{color: "black"}}> <strong>Rating:</strong> {movie.rating}</p>
					<p style={{color: "black"}}><strong>Description:</strong> {movie.description}</p>
                    
                    {/*Date input box*/}
                    <div
                        style={{
                        marginTop: "8px",
                        marginBottom: "8px",
                        padding: "4px",
                        border: "1px solid #ddd",
                        borderWidth: "1px",
                        borderRadius: "8px",
                        backgroundColor: "#f9f9f9",
                        maxWidth: "190px",
                        marginLeft: "0px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start"
                        }}
                    >
                        <h2 style={{ color: "black", marginBottom: "6px", textAlign: "left", fontSize: "15px", marginLeft: "1px" }}><strong>Select Date:</strong></h2>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{
                                width: "100px",
                                padding: "5px",
                                border: "1px solid #bbb",
                                borderRadius: "3px",
                                fontSize: "12px",
                                color: "black",
                                marginLeft: "38px",
                            }}
                        />
                    </div>

					<h2 style={{color: "black"}}><strong>Showtimes (select one below):</strong></h2>
					{/*List of showtimes as clickable links to booking page*/}
					<ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "5px"}}>
                        {movie.showtimes.map((time) => {
                            let href = `/booking?title=${encodeURIComponent(movie.title)}&time=${encodeURIComponent(time)}`;
                            if (date) {
                                href += `&date=${encodeURIComponent(date)}`;
                            }
                            return (
                                <li key={time}>
                                    <Link 
                                        href={href}
                                        style = {{
                                            display: "inline-block",
                                            padding: "8px 16px",
                                            margin: "4px",
                                            backgroundColor: "#000000ff",
                                            color: "white",
                                            borderRadius: "8px",
                                            textDecoration: "none",
                                            fontWeight: "bold",
                                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                            transition: "background-color 0.3s ease",
                                            cursor: "pointer"
                                        }}
                                    >
                                        {time}
                                    </Link>
                                </li>
                            );
                        })}
					</ul>
				</div>
			</div>

			<div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: "8px" }}>
				<h2 style={{fontSize: "20px", fontWeight: "bold", color: "black", marginBottom: "15px" }}>Trailer</h2>
				<iframe 
                    style = {{marginBottom: "20px", borderRadius: 12}}
					width="500"
					height="300"
                    src={`${movie.trailerEmbedUrl}?rel=0`}
					title="Movie Trailer"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				/>
			</div>
		</div>
	);
}

