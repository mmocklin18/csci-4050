"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function EditMoviePage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      try {
        const res = await fetch(`http://localhost:8000/movies/${id}`);
        if (!res.ok) throw new Error("Failed to fetch movie");
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error("Error fetching movie:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchMovie();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMovie({ ...movie, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8000/movies/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movie),
      });
      if (!res.ok) throw new Error("Failed to update movie");
      alert("Movie updated successfully!");
      router.push("/admin/movies");
    } catch (err) {
      console.error("Error updating movie:", err);
      alert("Failed to update movie");
    }
  };

  if (loading) return <p style={{ color: "black" }}>Loading...</p>;
  if (!movie) return <p style={{ color: "black" }}>Movie not found.</p>;

  return (
    <div
      style={{
        backgroundColor: "#fff",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Navbar />

      {/* TITLE */}
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
        Edit Movie
      </h1>

      {/* FORM */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "16px",
          paddingBottom: "40px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            width: "260px",
          }}
        >
          <label style={{ fontWeight: "bold", color: "black" }}>Name:</label>
          <input
            name="name"
            value={movie.name || ""}
            onChange={handleChange}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              color: "black",
              backgroundColor: "white",
            }}
          />

          <label style={{ fontWeight: "bold", color: "black" }}>Description:</label>
          <textarea
            name="description"
            value={movie.description || ""}
            onChange={handleChange}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              color: "black",
              backgroundColor: "white",
              height: "90px",
            }}
          />

          <label style={{ fontWeight: "bold", color: "black" }}>Rating:</label>
          <input
            name="rating"
            value={movie.rating || ""}
            onChange={handleChange}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              color: "black",
              backgroundColor: "white",
            }}
          />

          <label style={{ fontWeight: "bold", color: "black" }}>Runtime (min):</label>
          <input
            name="runtime"
            value={movie.runtime || ""}
            onChange={handleChange}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              color: "black",
              backgroundColor: "white",
            }}
          />

          <label style={{ fontWeight: "bold", color: "black" }}>Release Date:</label>
          <input
            name="release_date"
            value={movie.release_date || ""}
            onChange={handleChange}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              color: "black",
              backgroundColor: "white",
            }}
          />

          <label style={{ fontWeight: "bold", color: "black" }}>Main Genre:</label>
          <input
            name="main_genre"
            value={movie.main_genre || ""}
            onChange={handleChange}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              color: "black",
              backgroundColor: "white",
            }}
          />

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "black",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
