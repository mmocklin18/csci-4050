"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Promotion {
  promotions_id: number;
  code: string;
  discount: number;
  start_date: string | null;
  end_date: string | null;
}

export default function ManagePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const router = useRouter();
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.API_BASE ||
    process.env.API_BASE_URL ||
    "http://localhost:8000";

  useEffect(() => {
    async function fetchPromotions() {
      try {
        const res = await fetch(`${API_BASE}/admin/promotions/`);
        if (!res.ok) throw new Error("Failed to fetch promotions");
        const data = await res.json();
        setPromotions(data);
      } catch (err) {
        console.error("Error fetching promotions:", err);
      }
    }
    fetchPromotions();
  }, []);

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString() : "N/A";

  const handleAddPromotion = () => {
    router.push("/admin/promotions/add");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this promotion?")) return;

    try {
      const res = await fetch(`${API_BASE}/admin/promotions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPromotions((prev) => prev.filter((p) => p.promotions_id !== id));
      } else {
        alert("Failed to delete promotion");
      }
    } catch (err) {
      console.error("Error deleting promotion:", err);
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
          Manage Promotions
        </h1>

        <button
          onClick={handleAddPromotion}
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
          + Add Promotion
        </button>

        <ul style={{ width: "100%", maxWidth: "600px", listStyle: "none", padding: 0 }}>
          {promotions.length > 0 ? (
            promotions.map((p) => (
              <li
                key={p.promotions_id}
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
                  }}
                >
                  {p.code} — {p.discount}% off
                  {(p.start_date || p.end_date) && (
                    <div style={{ fontSize: "14px", color: "#555" }}>
                      {formatDate(p.start_date)} to {formatDate(p.end_date)}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(p.promotions_id)}
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
            <p style={{ color: "gray", textAlign: "center" }}>No promotions found.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
