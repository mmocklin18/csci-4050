"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Address {
  address_id: number;
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface Card {
  card_id: number;
  number: string;
  exp_date: string;
  cvc: string;
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
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    async function fetchProfileAndCards() {
      try {
        const token = localStorage.getItem("auth_token");
        const userId = localStorage.getItem("user_id");
        if (!token || !userId) {
          router.push("/");
          return;
        }

        // Fetch user info and cards
        const [userRes, cardRes] = await Promise.all([
          fetch(`${API_BASE}/user/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/cards/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!userRes.ok) throw new Error("Failed to load user profile");
        const userData = await userRes.json();
        setProfile(userData);

        if (cardRes.ok) {
          const cardData = await cardRes.json();
          setCards(cardData);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileAndCards();
  }, [API_BASE, router]);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px", color: "black" }}>
        Loading profile...
      </div>
    );

  if (!profile)
    return (
      <div style={{ textAlign: "center", marginTop: "50px", color: "black" }}>
        Failed to load profile.
      </div>
    );

  return (
    <div
      style={{
        backgroundColor: "#fff",
        minHeight: "100vh",
        color: "black",
      }}
    >
      <Navbar />

      <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          My Profile
        </h1>

        {/* Profile Info Card */}
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            marginBottom: "20px",
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
            <strong>Address:</strong>{" "}
            {profile.address ? (
              <span>
                {profile.address.street}, {profile.address.city},{" "}
                {profile.address.state} {profile.address.zip}
              </span>
            ) : (
              <span>No address on file</span>
            )}
          </div>
          <p>
            <strong>Promotions:</strong>{" "}
            {profile.promo ? "Subscribed" : "Unsubscribed"}
          </p>
        </div>

        {/* Payment Methods Section */}
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ textAlign: "center" }}>Payment Methods</h3>
          {cards.length === 0 ? (
            <p>No saved cards.</p>
          ) : (
            cards.map((card) => (
              <div
                key={card.card_id}
                style={{
                  borderBottom: "1px solid #eee",
                  paddingBottom: "10px",
                  marginBottom: "10px",
                }}
              >
                <p>
                  <strong>Card:</strong> •••• {card.number.slice(-4)}
                </p>
                <p>
                  <strong>Expires:</strong>{" "}
                  {new Date(card.exp_date).toLocaleDateString("en-US", {
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            onClick={() => router.push("/edit-profile")}
            style={{
              padding: "10px 20px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#000",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
