"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface FormInfo {
  firstName: string;
  lastName: string;
  email: string;
  billingAddress: string;
  password: string; // new password
  currentPassword?: string; // current password if changing
  promotions: boolean;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [formInfo, setFormInfo] = useState<FormInfo>({
    firstName: "",
    lastName: "",
    email: "",
    billingAddress: "",
    password: "",
    currentPassword: "",
    promotions: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setFormInfo({
            firstName: data.first_name ?? "",
            lastName: data.last_name ?? "",
            email: data.email ?? "",
            billingAddress: data.address ?? "",
            password: "",
            currentPassword: "",
            promotions: !!data.promotions,
          });
        } else {
          console.error("Failed to fetch profile:", res.status);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formInfo.firstName || !formInfo.lastName || !formInfo.billingAddress) {
      alert("Please fill in all required fields.");
      return;
    }

    if (formInfo.password && !formInfo.currentPassword) {
      alert("Please enter your current password to change your password.");
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formInfo.firstName,
          last_name: formInfo.lastName,
          address: formInfo.billingAddress,
          new_password: formInfo.password || undefined,
          current_password: formInfo.password ? formInfo.currentPassword : undefined,
          promotions: formInfo.promotions ? 1 : 0,
        }),
      });

      if (res.ok) {
        alert("Profile updated successfully!");
        router.push("/profile");
      } else {
        const errMsg = await res.text();
        alert("Failed to update profile: " + errMsg);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("An error occurred while updating your profile.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", color: "black" }}>
        Loading profile...
      </div>
    );
  }

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
        overflowY: "auto",
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
          textAlign: "center",
        }}
      >
        Edit Profile
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <input
          type="text"
          placeholder="First Name"
          value={formInfo.firstName}
          onChange={(e) =>
            setFormInfo({ ...formInfo, firstName: e.target.value })
          }
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={formInfo.lastName}
          onChange={(e) =>
            setFormInfo({ ...formInfo, lastName: e.target.value })
          }
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Email"
          value={formInfo.email}
          disabled
          style={{ ...inputStyle, backgroundColor: "#f2f2f2" }}
        />
        <textarea
          placeholder="Billing Address"
          value={formInfo.billingAddress}
          onChange={(e) =>
            setFormInfo({ ...formInfo, billingAddress: e.target.value })
          }
          style={{ ...inputStyle, height: "80px" }}
        />

        <input
          type="password"
          placeholder="New Password (leave blank to keep current)"
          value={formInfo.password}
          onChange={(e) =>
            setFormInfo({ ...formInfo, password: e.target.value })
          }
          style={{ ...inputStyle, width: "350px" }}
        />

        {/* Current Password field shows only if user typed a new password */}
        {formInfo.password && (
          <input
            type="password"
            placeholder="Current Password"
            required
            value={formInfo.currentPassword}
            onChange={(e) =>
              setFormInfo({ ...formInfo, currentPassword: e.target.value })
            }
            style={{ ...inputStyle, width: "350px" }}
          />
        )}

        <label style={{ color: "black" }}>
          <input
            type="checkbox"
            checked={formInfo.promotions}
            onChange={(e) =>
              setFormInfo({ ...formInfo, promotions: e.target.checked })
            }
            style={{ marginRight: "8px" }}
          />
          Receive promotional emails
        </label>

        <button type="submit" style={buttonStyle}>
          Save Changes
        </button>
      </form>
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
  cursor: "pointer",
};
