"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface ShowResponse {
  show_id: number;
  movieid: number;
  showroom_id: number;
  date_time: string;
  duration: number;
}

interface MovieResponse {
  movie_id: number;
  name: string;
}

interface ShowroomResponse {
  showroom_id: number;
  name: string;
}

export default function ManageShowtimes() {
  const [shows, setShows] = useState<ShowResponse[]>([]);
  const [movieLookup, setMovieLookup] = useState<Record<number, string>>({});
  const [showroomLookup, setShowroomLookup] = useState<Record<number, string>>({});
  const router = useRouter();

  useEffect(() => {
    async function fetchShowtimes() {
      try {
        const [showsRes, moviesRes, showroomsRes] = await Promise.all([
          fetch("http://localhost:8000/shows/"),
          fetch("http://localhost:8000/movies/"),
          fetch("http://localhost:8000/showrooms/"),
        ]);

        if (!showsRes.ok || !moviesRes.ok || !showroomsRes.ok) {
          throw new Error("Failed to fetch showtime data");
        }

        const [showsData, moviesData, showroomsData] = await Promise.all([
          showsRes.json() as Promise<ShowResponse[]>,
          moviesRes.json() as Promise<MovieResponse[]>,
          showroomsRes.json() as Promise<ShowroomResponse[]>,
        ]);

        const movieMap: Record<number, string> = {};
        moviesData.forEach((movie) => {
          movieMap[movie.movie_id] = movie.name;
        });

        const showroomMap: Record<number, string> = {};
        showroomsData.forEach((room) => {
          showroomMap[room.showroom_id] = room.name;
        });

        setShows(showsData);
        setMovieLookup(movieMap);
        setShowroomLookup(showroomMap);
      } catch (err) {
        console.error("Error fetching showtimes:", err);
      }
    }
    fetchShowtimes();
  }, []);

  const handleAddShowtime = () => {
    router.push("/admin/showtimes/add");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this showtime?")) return;

    try {
      const res = await fetch(`http://localhost:8000/shows/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setShows((prev) => prev.filter((s) => s.show_id !== id));
      } else {
        const body = await res.json().catch(() => null);
        alert(body?.detail ?? "Failed to delete showtime");
      }
    } catch (err) {
      console.error("Error deleting showtime:", err);
      alert("Failed to delete showtime");
    }
  };

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <Navbar />
      <div
        style={{
          marginTop: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 16px",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "16px",
            color: "black",
          }}
        >
          Manage Showtimes
        </h1>

        <button
          onClick={handleAddShowtime}
          style={{
            padding: "10px 20px",
            backgroundColor: "#000000ff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          + Add Showtime
        </button>

        <ul style={{ width: "100%", maxWidth: "700px", listStyle: "none", padding: 0 }}>
          {shows.length > 0 ? (
            shows.map((s) => (
              <li
                key={s.show_id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <div
                  style={{
                    color: "black",
                    fontWeight: "bold",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span>{movieLookup[s.movieid] ?? `Movie #${s.movieid}`}</span>
                  <span style={{ fontSize: "14px", color: "gray" }}>
                    {showroomLookup[s.showroom_id] ?? `Showroom #${s.showroom_id}`} — {new Date(s.date_time).toLocaleString()} — Duration: {s.duration} min
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(s.show_id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#b91c1c",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </li>
            ))
          ) : (
            <p style={{ color: "gray", textAlign: "center" }}>No showtimes found.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
