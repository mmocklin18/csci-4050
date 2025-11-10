"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditMoviePage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      try {
        const res = await fetch(`http://localhost:8000/movies/${id}/`);
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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this movie?")) return;
    try {
      const res = await fetch(`http://localhost:8000/movies/${id}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete movie");
      alert("Movie deleted successfully!");
      router.push("/admin/movies");
    } catch (err) {
      console.error("Error deleting movie:", err);
      alert("Failed to delete movie");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!movie) return <div className="p-8">Movie not found.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Movie</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={movie.name || ""}
          onChange={handleChange}
          placeholder="Movie Name"
          className="border p-2 w-full rounded"
        />
        <textarea
          name="description"
          value={movie.description || ""}
          onChange={handleChange}
          placeholder="Description"
          className="border p-2 w-full rounded"
        />
        <input
          name="rating"
          value={movie.rating || ""}
          onChange={handleChange}
          placeholder="Rating (G, PG, PG-13, R)"
          className="border p-2 w-full rounded"
        />
        <input
          name="runtime"
          value={movie.runtime || ""}
          onChange={handleChange}
          placeholder="Runtime (minutes)"
          className="border p-2 w-full rounded"
        />
        <input
          name="release_date"
          value={movie.release_date || ""}
          onChange={handleChange}
          placeholder="Release Date"
          className="border p-2 w-full rounded"
        />
        <input
          name="main_genre"
          value={movie.main_genre || ""}
          onChange={handleChange}
          placeholder="Main Genre"
          className="border p-2 w-full rounded"
        />

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save Changes
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete Movie
          </button>
        </div>
      </form>
    </div>
  );
}
