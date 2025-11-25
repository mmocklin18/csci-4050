//Specific movie details page with showtimes linking to booking page
"use client";
import React from "react";
import Link from "next/link";
import {useState, useEffect} from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";

// backend shape
type ApiMovie = {
    movie_id: number;
    name: string;
    description: string;
    rating: "G" | "PG" | "PG-13" | "R";
    runtime: number;
    release_date: string;
    available: boolean;
    poster: string;
    trailer: string | null;
    theater: string | null;
    main_genre: string;
};

type ApiShow = {
    show_id: number;
    movieid: number;
    showroom_id: number;
    date_time: string;
    duration: number;
};

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
};

function mapApiToUi(m: ApiMovie) {
    return {
        id: String(m.movie_id),
        title: m.name,
        rating: m.rating,
        description: m.description,
        posterUrl: m.poster ?? "/placeholder.png",
        trailerEmbedUrl: toYouTubeEmbed(m.trailer),
    };
}

function showDateValue(dateStr: string): string {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
}

function formatShowLabel(dateStr: string): string {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "TBA";
    return date.toLocaleTimeString([], { timeStyle: "short" });
    return date.toLocaleTimeString([], { timeStyle: "short" });
}

export default function MovieDetails() {
    const { id } = useParams<{ id: string }>();
    const [date, setDate] = useState("");
    const [dateFocused, setDateFocused] = useState(false);
    const [movie, setMovie] = useState<ReturnType<typeof mapApiToUi> | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showtimes, setShowtimes] = useState<ApiShow[]>([]);
    const [showtimeErr, setShowtimeErr] = useState<string | null>(null);
    const [showtimeLoading, setShowtimeLoading] = useState(true);
    const todayStr = new Date().toISOString().split("T")[0];
    const todayStr = new Date().toISOString().split("T")[0];

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

    useEffect(() => {
        if (!id) return;
        let alive = true;
        (async () => {
            try {
                setShowtimeLoading(true);
                const res = await fetch(`/api/shows?movie_id=${encodeURIComponent(String(id))}`, {
                    cache: "no-store",
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: ApiShow[] = await res.json();
                if (!alive) return;
                setShowtimes(data ?? []);
                setShowtimeErr(null);
            } catch (error: unknown) {
                if (!alive) return;
                setShowtimes([]);
                setShowtimeErr(error instanceof Error ? error.message : "Failed to load showtimes");
            } finally {
                if (alive) setShowtimeLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [id]);

    useEffect(() => {
        if (!date && showtimes.length) {
            const now = new Date();
            const future = showtimes.filter((show) => {
                const dt = new Date(show.date_time);
                return !Number.isNaN(dt.getTime()) && dt >= now;
            });

            if (future.length > 0) {
                const first = showDateValue(future[0].date_time);
                if (first) setDate(first);
            }
            const now = new Date();
            const future = showtimes.filter((show) => {
                const dt = new Date(show.date_time);
                return !Number.isNaN(dt.getTime()) && dt >= now;
            });

            if (future.length > 0) {
                const first = showDateValue(future[0].date_time);
                if (first) setDate(first);
            }
        }
    }, [showtimes, date]);


    const now = new Date();

    const futureShowtimes = showtimes.filter((show) => {
        const dt = new Date(show.date_time);
        if (Number.isNaN(dt.getTime())) return false;
        return dt >= now;
    });

    const filteredShowtimes = futureShowtimes.filter((show) => {

    const now = new Date();

    const futureShowtimes = showtimes.filter((show) => {
        const dt = new Date(show.date_time);
        if (Number.isNaN(dt.getTime())) return false;
        return dt >= now;
    });

    const filteredShowtimes = futureShowtimes.filter((show) => {
        if (!date) return true;
        return showDateValue(show.date_time) === date;
    });

    const showtimesFiltered = filteredShowtimes;
    const noMatchesForDate = Boolean(
        date && filteredShowtimes.length === 0 && futureShowtimes.length > 0
    );


    const showtimesFiltered = filteredShowtimes;
    const noMatchesForDate = Boolean(
        date && filteredShowtimes.length === 0 && futureShowtimes.length > 0
    );


    if (loading) return <main className="p-6">Loading…</main>;
    if (err) return <main className="p-6 text-red-600">Error: {err}</main>;
    if (!movie) return <main className="p-6">Movie not found.</main>;


    return (
        <div style={{ backgroundColor: "#fff", top: 0, left: 0, right: 0, bottom: 0, margin: 0, padding: 0}}>
            <Navbar/>
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
                            padding: "6px",
                            border: `1px solid ${dateFocused ? "#fc6767ff" : "#e2e8f0"}` ,
                            borderRadius: "10px",
                            backgroundColor: dateFocused ? "#fff0f0ff" : "#f9f9f9",
                            maxWidth: "220px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            boxShadow: dateFocused ? "0 4px 12px rgba(76,154,255,0.12)" : "none",
                            transition: "all 160ms ease-in-out",
                        }}
                    >
                        <h2 style={{ color: "black", marginBottom: "6px", textAlign: "left", fontSize: "15px", marginLeft: "1px" }}><strong>Select Date:</strong></h2>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                            {/* Calendar icon */}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.9 }}>
                                <path d="M7 11H9V13H7V11Z" fill="#6b7280" />
                                <path d="M11 11H13V13H11V11Z" fill="#6b7280" />
                                <path d="M15 11H17V13H15V11Z" fill="#6b7280" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M5 4C4.44772 4 4 4.44772 4 5V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V5C20 4.44772 19.5523 4 19 4H17V3H15V4H9V3H7V4H5ZM6 8H18V18H6V8Z" fill="#6b7280" />
                            </svg>
                            <input
                                type="date"
                                value={date}
                                min={todayStr}
                                min={todayStr}
                                onChange={(e) => setDate(e.target.value)}
                                onFocus={() => setDateFocused(true)}
                                onBlur={() => setDateFocused(false)}
                                aria-label="Select show date"
                                style={{
                                    flex: 1,
                                    padding: "8px 10px",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    color: "#111827",
                                    backgroundColor: "transparent",
                                    outline: "none",
                                    cursor: "pointer",
                                    WebkitAppearance: "none",
                                }}
                            />
                        </div>
                    </div>

                    <h2 style={{color: "black"}}><strong>Showtimes (select one below):</strong></h2>
                    {showtimeLoading ? (
                        <p style={{ color: "#555" }}>Loading showtimes…</p>
                    ) : showtimeErr ? (
                        <p style={{ color: "#b91c1c" }}>
                            Error loading showtimes: {showtimeErr}
                        </p>
                    ) : futureShowtimes.length === 0 ? (
                        <p style={{ color: "#555" }}>
                            No upcoming showtimes. Please check back later.
                        </p>
                    ) : (
                        <>
                            {noMatchesForDate && (
                                <p style={{ color: "#b45309" }}>
                                    No showtimes on the selected date.
                                </p>
                            )}
                            <ul
                                style={{
                                    listStyle: "none",
                                    padding: 0,
                                    margin: 0,
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "5px",
                                }}
                            >
                                {showtimesFiltered.map((show) => {
                                    const label = formatShowLabel(show.date_time);
                                    const showDate = showDateValue(show.date_time);
                                    const href = `/booking?title=${encodeURIComponent(
                                        movie.title
                                    )}&showId=${show.show_id}&time=${encodeURIComponent(
                                        show.date_time
                                    )}${
                                        showDate
                                            ? `&date=${encodeURIComponent(showDate)}`
                                            : ""
                                    }&showroom=${encodeURIComponent(
                                        String(show.showroom_id)
                                    )}`;

                                    return (
                                        <li key={show.show_id}>
                                            <Link
                                                href={href}
                                                onClick={() => {
                                                    if (showDate) {
                                                        localStorage.setItem(
                                                            "selectedDate",
                                                            showDate
                                                        );
                                                    }
                                                }}
                                                style={{
                                                    display: "inline-block",
                                                    padding: "8px 16px",
                                                    margin: "4px",
                                                    backgroundColor: "#000000ff",
                                                    color: "white",
                                                    borderRadius: "8px",
                                                    textDecoration: "none",
                                                    fontWeight: "bold",
                                                    boxShadow:
                                                        "0 4px 6px rgba(0, 0, 0, 0.1)",
                                                    transition:
                                                        "background-color 0.3s ease",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    )}
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