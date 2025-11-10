"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface ApiMovie {
  movie_id: number;
  name: string;
  description: string;
  rating: string;
  runtime: number;
  release_date: string;
  available: boolean;
  poster: string;
  trailer: string | null;
  main_genre: string;
}

export default function ManageMovies() {
  const [movies, setMovies] = useState<ApiMovie[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchMovies() {
      try {
        const res = await fetch("http://localhost:8000/movies/");
        if (!res.ok) throw new Error("Failed to fetch movies");
        const data = await res.json();
        setMovies(data);
      } catch (err) {
        console.error("Error fetching movies:", err);
      }
    }
    fetchMovies();
  }, []);

  const handleAddMovie = () => {
    router.push("/admin/movies/add");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this movie?")) return;

    try {
      const res = await fetch(`http://localhost:8000/movies/${id}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMovies((prev) => prev.filter((m) => m.movie_id !== id));
      } else {
        alert("Failed to delete movie");
      }
    } catch (err) {
      console.error("Error deleting movie:", err);
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
          Manage Movies
        </h1>

        <button
          onClick={handleAddMovie}
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
          + Add Movie
        </button>

        <ul style={{ width: "100%", maxWidth: "600px", listStyle: "none", padding: 0 }}>
          {movies.length > 0 ? (
            movies.map((m) => (
              <li
                key={m.movie_id}
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
                  onClick={() => router.push(`/admin/movies/${m.movie_id}`)}
                  style={{
                    cursor: "pointer",
                    color: "black",
                    fontWeight: "bold",
                  }}
                >
                  {m.name}
                </div>
                <button
                  onClick={() => handleDelete(m.movie_id)}
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
            <p style={{ color: "gray", textAlign: "center" }}>No movies found.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
