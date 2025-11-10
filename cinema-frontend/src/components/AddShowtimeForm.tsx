"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ShowtimeForm() {
  const [movies, setMovies] = useState<any[]>([]);
  const [movieId, setMovieId] = useState("");
  const [theater, setTheater] = useState("");
  const [showtime, setShowtime] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:8000/movies/");
        if (!res.ok) throw new Error("Failed to fetch movies");
        const data = await res.json();
        setMovies(data);
      } catch (err) {
        console.error("Error fetching movies:", err);
      }
    };
    fetchMovies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/admin/showtimes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movie_id: parseInt(movieId),
          theater,
          showtime,
        }),
      });

      if (!res.ok) throw new Error("Failed to add showtime");
      alert("Showtime added successfully!");
      router.push("/admin/showtimes");
    } catch (err) {
      console.error(err);
      alert("Error adding showtime.");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
      }}
    >
      <Navbar />

      <h1
        style={{
          marginTop: "30px",
          fontSize: "24px",
          fontWeight: "bold",
          color: "black",
          marginBottom: "16px",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        Add Showtime
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "16px",
        }}
      >
        {/* Movie Selection */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "10px",
            alignItems: "center",
          }}
        >
          <label
            style={{
              fontWeight: "bold",
              color: "black",
              marginBottom: "5px",
              fontSize: "15px",
            }}
          >
            Select Movie:
          </label>
          <select
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
            required
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: "#f9f9f9",
              color: "black",
              width: "220px",
              textAlign: "center",
            }}
          >
            <option value="">Select a movie</option>
            {movies.map((movie, index) => (
              <option key={movie.movie_id ?? index} value={movie.movie_id}>
                {movie.name}
              </option>
            ))}
          </select>
        </div>

        {/* Theater Number */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "10px",
            alignItems: "center",
          }}
        >
          <label
            style={{
              fontWeight: "bold",
              color: "black",
              marginBottom: "5px",
              fontSize: "15px",
            }}
          >
            Theater Number:
          </label>
          <input
            type="number"
            placeholder="Enter theater number"
            value={theater}
            onChange={(e) => setTheater(e.target.value)}
            required
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: "#f9f9f9",
              color: "black",
              width: "220px",
              textAlign: "center",
            }}
          />
        </div>

        {/* Showtime */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "10px",
            alignItems: "center",
          }}
        >
          <label
            style={{
              fontWeight: "bold",
              color: "black",
              marginBottom: "5px",
              fontSize: "15px",
            }}
          >
            Showtime:
          </label>
          <input
            type="datetime-local"
            value={showtime}
            onChange={(e) => setShowtime(e.target.value)}
            required
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: "#f9f9f9",
              color: "black",
              width: "220px",
              textAlign: "center",
            }}
          />
        </div>

        {/* Submit Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#000000ff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Add Showtime
          </button>
        </div>
      </form>
    </div>
  );
}
