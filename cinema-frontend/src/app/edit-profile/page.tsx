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

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  address: Address | null;
  promo: boolean;
}

interface Card {
  card_id: number;
  number: string;
  exp_date: string;
  cvc: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    new_password: "",
    current_password: "",
    promo: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [newCard, setNewCard] = useState({ number: "", exp_date: "", cvc: "" });

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  // Fetch profile and cards
  useEffect(() => {
    async function fetchProfileAndCards() {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          router.push("/");
          return;
        }

        const [userRes, cardsRes] = await Promise.all([
          fetch(`${API_BASE}/user/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/cards/user/${localStorage.getItem("user_id")}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!userRes.ok) throw new Error("Failed to load profile");
        const userData = await userRes.json();
        setProfile(userData);

        setForm({
          first_name: userData.first_name ?? "",
          last_name: userData.last_name ?? "",
          street: userData.address?.street ?? "",
          city: userData.address?.city ?? "",
          state: userData.address?.state ?? "",
          zip: userData.address?.zip ?? "",
          new_password: "",
          current_password: "",
          promo: !!userData.promo,
        });

        if (cardsRes.ok) {
          const cardData = await cardsRes.json();
          setCards(cardData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileAndCards();
  }, [API_BASE, router]);

  // Handle profile updates
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    if (!token) return alert("Not authenticated");

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/user/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          address: {
            street: form.street,
            city: form.city,
            state: form.state,
            zip: form.zip,
          },
          new_password: form.new_password || undefined,
          current_password: form.new_password
            ? form.current_password
            : undefined,
          promo: form.promo,
        }),
      });

      if (res.ok) {
        alert("Profile updated successfully!");
        router.push("/profile");
      } else {
        const err = await res.text();
        alert("Update failed: " + err);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("An error occurred while updating your profile.");
    } finally {
      setSaving(false);
    }
  };

  // Handle card addition
  const handleAddCard = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return alert("Not authenticated");
    if (!newCard.number || !newCard.exp_date || !newCard.cvc) {
      return alert("Please fill out all card fields");
    }

    try {
      const res = await fetch(`${API_BASE}/cards/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          number: newCard.number,
          exp_date: newCard.exp_date,
          cvc: newCard.cvc,
          customer_id: parseInt(localStorage.getItem("user_id") || "0", 10),
          address_id: profile?.address?.address_id ?? null,
        }),
      });

      if (res.ok) {
        const newCardData = await res.json();
        setCards((prev) => [...prev, newCardData]);
        setNewCard({ number: "", exp_date: "", cvc: "" });
      } else {
        const errText = await res.text();
        alert(`Error adding card: ${errText}`);
      }
    } catch (err) {
      console.error("Error adding card:", err);
    }
  };

  // Loading & error states
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

  // Render UI
  return (
    <div
      style={{
        backgroundColor: "#fff",
        minHeight: "100vh",
        color: "black",
        overflowY: "auto",
      }}
    >
      <Navbar />

      <h1
        style={{
          marginTop: "30px",
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Edit Profile
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "40px",
          padding: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* LEFT COLUMN — Current Info + Payment Methods */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* CURRENT INFO */}
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "20px",
              width: "300px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ textAlign: "center" }}>Current Info</h3>
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

          {/* PAYMENT METHODS */}
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "20px",
              width: "300px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ textAlign: "center" }}>Payment Methods</h3>

            {cards.length === 0 ? (
              <p>No cards on file.</p>
            ) : (
              cards.map((c) => (
                <p key={c.card_id}>
                  •••• {c.number.slice(-4)} (exp{" "}
                  {new Date(c.exp_date).getFullYear()})
                </p>
              ))
            )}

            {cards.length < 4 ? (
              <>
                <h4 style={{ marginTop: "10px" }}>Add New Card</h4>
                <input
                  type="text"
                  placeholder="Card Number"
                  value={newCard.number}
                  onChange={(e) =>
                    setNewCard({ ...newCard, number: e.target.value })
                  }
                  style={inputStyle}
                />
                <input
                  type="month"
                  placeholder="Expiration Date"
                  value={newCard.exp_date}
                  onChange={(e) =>
                    setNewCard({ ...newCard, exp_date: e.target.value })
                  }
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="CVC"
                  value={newCard.cvc}
                  onChange={(e) =>
                    setNewCard({ ...newCard, cvc: e.target.value })
                  }
                  style={inputStyle}
                />
                <button onClick={handleAddCard} style={buttonStyle}>
                  Add Card
                </button>
              </>
            ) : (
              <p style={{ color: "gray" }}>
                You have reached the 4-card limit.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — Edit Info */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "20px",
            width: "350px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Edit Info</h3>
          <input
            type="text"
            placeholder="First Name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            style={inputStyle}
          />
          <h4>Billing Address</h4>
          <input
            type="text"
            placeholder="Street"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="ZIP"
            value={form.zip}
            onChange={(e) => setForm({ ...form, zip: e.target.value })}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="New Password (optional)"
            value={form.new_password}
            onChange={(e) =>
              setForm({ ...form, new_password: e.target.value })
            }
            style={{ ...inputStyle, width: "100%" }}
          />

          {form.new_password && (
            <input
              type="password"
              placeholder="Current Password"
              required
              value={form.current_password}
              onChange={(e) =>
                setForm({ ...form, current_password: e.target.value })
              }
              style={{ ...inputStyle, width: "100%" }}
            />
          )}

          <label style={{ color: "black" }}>
            <input
              type="checkbox"
              checked={form.promo}
              onChange={(e) =>
                setForm({ ...form, promo: e.target.checked })
              }
              style={{ marginRight: "8px" }}
            />
            Receive promotional emails
          </label>

          <button
            type="submit"
            disabled={saving}
            style={{
              ...buttonStyle,
              opacity: saving ? 0.7 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #000",
  width: "250px",
  color: "black",
};

const buttonStyle = {
  padding: "10px 20px",
  borderRadius: "4px",
  border: "none",
  backgroundColor: "#000",
  color: "white",
};
