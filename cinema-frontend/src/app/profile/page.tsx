"use client";

//import  
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  address: Address | null;
  promo: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/");
        return;
      }

      const res = await fetch(`${API_BASE}/user/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          console.error("Failed to load profile:", res.status);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", color: "black" }}>
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", color: "black" }}>
        No profile data found.
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#fff",
        minHeight: "100vh",
        color: "black",
      }}
    >
      <Navbar />
      <h1
        style={{
          marginTop: "30px",
          textAlign: "center",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        My Profile
      </h1>

      <div
        style={{
          maxWidth: "400px",
          margin: "30px auto",
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "20px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <p>
          <strong>First Name:</strong> {profile.first_name}
        </p>
        <p>
          <strong>Last Name:</strong> {profile.last_name}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
        <div>
          <strong>Billing Address:</strong>{" "}
          {profile.address ? (
            <span>
              {profile.address.street}, {profile.address.city}, {profile.address.state}{" "}
              {profile.address.zip}
            </span>
          ) : (
            <span>No address on file</span>
          )}
        </div>

        <p>
          <strong>Promotions:</strong>{" "}
          {profile.promo ? "Subscribed" : "Unsubscribed"}
        </p>

        <button
          onClick={() => router.push("/edit-profile")}
          style={{
            marginTop: "20px",
            width: "100%",
            backgroundColor: "#000",
            color: "white",
            border: "none",
            padding: "10px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
