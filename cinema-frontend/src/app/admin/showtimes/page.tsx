"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface ApiShowtime {
  showtime_id: number;
  movie_name: string;
  theater_name: string;
  start_time: string;
  price: number;
}

export default function ManageShowtimes() {
  const [showtimes, setShowtimes] = useState<ApiShowtime[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchShowtimes() {
      try {
        const res = await fetch("http://localhost:8000/showtimes/");
        if (!res.ok) throw new Error("Failed to fetch showtimes");
        const data = await res.json();
        setShowtimes(data);
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
      const res = await fetch(`http://localhost:8000/showtimes/${id}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        setShowtimes((prev) => prev.filter((s) => s.showtime_id !== id));
      } else {
        alert("Failed to delete showtime");
      }
    } catch (err) {
      console.error("Error deleting showtime:", err);
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
          {showtimes.length > 0 ? (
            showtimes.map((s) => (
              <li
                key={s.showtime_id}
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
                  onClick={() => router.push(`/admin/showtimes/${s.showtime_id}`)}
                  style={{
                    cursor: "pointer",
                    color: "black",
                    fontWeight: "bold",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span>{s.movie_name}</span>
                  <span style={{ fontSize: "14px", color: "gray" }}>
                    {s.theater_name} — {new Date(s.start_time).toLocaleString()} — ${s.price}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(s.showtime_id)}
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
