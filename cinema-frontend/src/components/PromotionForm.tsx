"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function PromotionForm() {
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const router = useRouter();
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.API_BASE ||
    process.env.API_BASE_URL ||
    "http://localhost:8000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: Record<string, unknown> = {
        code: code.trim(),
        discount: parseFloat(discount),
      };

      if (startDate) payload.start_date = startDate;
      if (endDate) payload.end_date = endDate;

      const res = await fetch(`${API_BASE}/admin/promotions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add promotion");
      alert("Promotion added successfully!");
      router.push("/admin/promotions");
    } catch (err) {
      console.error(err);
      alert("Error adding promotion.");
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
        Add Promotion
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
        {/* Promo Code */}
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
            Promo Code:
          </label>
          <input
            type="text"
            placeholder="Enter promo code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
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

        {/* Discount */}
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
            Discount (%):
          </label>
          <input
            type="number"
            placeholder="e.g. 15"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
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

        {/* Start Date */}
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
            Start Date:
          </label>
          <input
            type="date"
            value={startDate}
            required
            onChange={(e) => setStartDate(e.target.value)}
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

        {/* End Date */}
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
            End Date:
          </label>
          <input
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
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
            Add Promotion
          </button>
        </div>
      </form>
    </div>
  );
}
