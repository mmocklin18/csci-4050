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

interface ReservedSeat {
  reserved_id: number;
  seat_id: number;
  show_id: number;
  user_id: number;
  booked_at: string;
}

interface Order {
  booking_id: number;
  show_id: number;
  total_amount: number;
  created_at: string;
  reserved_seats: ReservedSeat[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("auth_token");
        const userId = localStorage.getItem("user_id");
        if (!token || !userId) {
          router.push("/");
          return;
        }

        const [userRes, cardRes, orderRes] = await Promise.all([
          fetch(`${API_BASE}/user/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/cards/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/orders/history`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setProfile(userData);
        }

        if (cardRes.ok) {
          const cardData = await cardRes.json();
          setCards(cardData);
        }

        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrders(orderData);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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
    <div style={{ backgroundColor: "#fff", minHeight: "100vh", color: "black" }}>
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

        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            marginBottom: "20px",
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

        {/* Order History Section */}
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ textAlign: "center" }}>Order History</h3>
          {orders.length === 0 ? (
            <p>No previous orders.</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.booking_id}
                style={{
                  borderBottom: "1px solid #eee",
                  paddingBottom: "10px",
                  marginBottom: "10px",
                }}
              >
                <p>
                  <strong>Booking ID:</strong> {order.booking_id}
                </p>
                <p>
                  <strong>Show ID:</strong> {order.show_id}
                </p>
                <p>
                  <strong>Total:</strong> ${order.total_amount.toFixed(2)}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(order.created_at).toLocaleString()}
                </p>
                <p>
                  <strong>Seats:</strong>{" "}
                  {order.reserved_seats
                    .map((s) => `Seat ${s.seat_id}`)
                    .join(", ")}
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
