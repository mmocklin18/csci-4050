"use client";

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

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    async function fetchProfile() {
      try {
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

        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();

        setProfile(data);
        setForm({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          street: data.address?.street ?? "",
          city: data.address?.city ?? "",
          state: data.address?.state ?? "",
          zip: data.address?.zip ?? "",
          new_password: "",
          current_password: "",
          promo: !!data.promo,
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [API_BASE, router]);

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
        current_password: form.new_password ? form.current_password : undefined,
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
        {/* CURRENT INFO PANEL */}
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
        </div>

        {/* EDIT FORM PANEL */}
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
              onChange={(e) => setForm({ ...form, promo: e.target.checked })}
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
