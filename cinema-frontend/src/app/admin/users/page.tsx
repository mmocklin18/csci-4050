"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  promo: boolean;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.API_BASE ||
  process.env.API_BASE_URL ||
  "http://localhost:8000";

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          router.push("/");
          return;
        }
        const res = await fetch(`${API_BASE}/user/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    }
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Not authenticated");
        return;
      }

      const res = await fetch(`${API_BASE}/user/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.user_id !== id));
      } else {
        alert("Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
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
          Manage Users
        </h1>

        <ul style={{ width: "100%", maxWidth: "700px", listStyle: "none", padding: 0 }}>
          {users.length > 0 ? (
            users.map((u) => (
              <li
                key={u.user_id}
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
                  onClick={() => router.push(`/admin/users/${u.user_id}`)}
                  style={{
                    cursor: "pointer",
                    color: "black",
                    fontWeight: "bold",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span>
                    {u.first_name} {u.last_name}
                  </span>
                  <span style={{ fontSize: "14px", color: "gray" }}>
                    {u.email}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(u.user_id)}
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
            <p style={{ color: "gray", textAlign: "center" }}>No users found.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
