"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  state: string; // active, inactive, suspended
}

export default function UserDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [user, setUser] = useState<User | null>(null);
  const [stateValue, setStateValue] = useState("active");

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("auth_token");

        const res = await fetch(`http://127.0.0.1:8000/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        console.log("USER FROM BACKEND:", data);
        setUser(data);
        setStateValue(data.state);
      } catch (err) {
        console.error(err);
      }
    }

    fetchUser();
  }, [id]);

  async function handleSave() {
    try {
      const token = localStorage.getItem("auth_token");

      const res = await fetch(`http://127.0.0.1:8000/user/${id}/state`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ state: stateValue }),
      });

      if (res.ok) {
        alert("User state updated!");
        router.push("/admin/users");
      } else {
        alert("Failed to update");
      }
    } catch {
      alert("Error updating user");
    }
  }

  if (!user) return <p style={{ color: "black" }}>Loading...</p>;

  return (
    <div
      style={{
        backgroundColor: "#fff",
        position: "fixed",
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
        Edit User
      </h1>

      {/* FORM */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "16px",
        }}
      >
        {/* NAME */}
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
            Name:
          </label>
          <input
            type="text"
            value={`${user.first_name} ${user.last_name}`}
            disabled
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: "#eaeaea",
              color: "black",
              width: "220px",
              textAlign: "center",
              cursor: "not-allowed",
            }}
          />
        </div>

        {/* EMAIL */}
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
            Email:
          </label>
          <input
            type="text"
            value={user.email}
            disabled
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: "#eaeaea",
              color: "black",
              width: "220px",
              textAlign: "center",
              cursor: "not-allowed",
            }}
          />
        </div>

        {/* STATUS DROPDOWN */}
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
            Status:
          </label>

          <select
            value={stateValue}
            onChange={(e) => setStateValue(e.target.value)}
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
            <option value="Active" style={{ color: "black" }}>
              Active
            </option>
            <option value="Inactive" style={{ color: "black" }}>
              Inactive
            </option>
            <option value="Suspended" style={{ color: "black" }}>
              Suspended
            </option>
          </select>
        </div>

        {/* SAVE BUTTON */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          <button
            onClick={handleSave}
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
