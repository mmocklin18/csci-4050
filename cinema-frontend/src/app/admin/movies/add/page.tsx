"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function AddMoviePage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    rating: "",
    runtime: "",
    release_date: "",
    available: false,
    poster: "",
    trailer: "",
    main_genre: "",
  });

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setForm({ ...form, [name]: Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("Movie added successfully!");
        router.push("/admin/movies");
      } else {
        alert("Failed to add movie.");
      }
    } catch (err) {
      console.error("Error adding movie:", err);
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
          Add Movie
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            width: "100%",
            maxWidth: "500px",
          }}
        >
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              color: "black",
            }}
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              minHeight: "100px",
              color: "black",
            }}
          />

          <input
            name="rating"
            type="number"
            placeholder="Rating"
            value={form.rating}
            onChange={handleChange}
            required
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              color: "black",
            }}
          />

          <input
            name="runtime"
            type="number"
            placeholder="Runtime (minutes)"
            value={form.runtime}
            onChange={handleChange}
            required
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              color: "black",
            }}
          />

          <label style={{ color: "black" }}>Release Date</label>
          <input
            name="release_date"
            type="date"
            placeholder="Release Date"
            value={form.release_date}
            onChange={handleChange}
            required
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              color: "black",
            }}
          />

          <label style={{ color: "black" }}>Availability</label>
          <select
            name="available"
            value={form.available ? "true" : "false"}
            onChange={(e) =>
              setForm({ ...form, available: e.target.value === "true" })
            }
            required
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              color: "black",
            }}
          >
            <option value="true">Available</option>
            <option value="false">Not Available</option>
          </select>

          <input
            name="poster"
            placeholder="Poster URL"
            value={form.poster}
            onChange={handleChange}
            required
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              color: "black",
            }}
          />

          <input
            name="trailer"
            placeholder="Trailer URL"
            value={form.trailer}
            onChange={handleChange}
            required
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              color: "black",
            }}
          />

          <input
            name="main_genre"
            placeholder="Main Genre"
            value={form.main_genre}
            onChange={handleChange}
            required
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              color: "black",
            }}
          />

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
              marginTop: "8px",
            }}
          >
            Add Movie
          </button>
        </form>
      </div>
    </div>
  );
}
