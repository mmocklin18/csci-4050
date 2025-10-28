"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE || process.env.API_BASE_URL || "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const url = `${API_BASE}/auth/forgot-password`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.detail === "string" ? data.detail : data?.message || "Request failed");
        return;
      }
      setMessage(data?.message || "If that address exists we'll send password reset instructions shortly.");
      setEmail("");
    } catch (ex: any) {
      setError(ex?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link href="/" className="backBtn" aria-label="Back to home">← Back</Link>
      <div className="pageWrap">
        <div className="card">
          <h3 className="title">Forgot your password?</h3>
        <p className="subtitle">Enter your email and we'll send instructions to reset your password.</p>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span className="label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <button className="primary" disabled={loading}>
            {loading ? "Sending…" : "Send reset instructions"}
          </button>
        </form>
      </div>
      </div>

    <style jsx>{`
      .backBtn { position: fixed; top: 16px; left: 16px; color: #fff; background: #000; text-decoration: none; font-weight: 700; z-index: 9999; padding: 8px 12px; border-radius: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.25); }
      .backBtn:hover { opacity: 0.95 }
      .backBtn:focus { outline: 2px solid rgba(255,255,255,0.12); outline-offset: 2px }

      .pageWrap { min-height: 60vh; display: flex; align-items: center; justify-content: center; padding: 32px; }
      .card { width: min(92vw, 520px); background: #fff; border: 1px solid #ececec; border-radius: 12px; padding: 22px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
      .title { font-size: 20px; font-weight: 800; margin: 0 0 6px; color: black }
      .subtitle { margin: 0 0 12px; color: #555 }
      .alert { padding: 10px 12px; border-radius: 8px; margin-bottom: 12px }
      .alert.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca }
      .alert.success { background: #ecfdf5; color: #065f46; border: 1px solid #bbf7d0 }
      .form { display: grid; gap: 12px }
      .field { display: grid; gap: 6px; color: black }
      .label { font-size: 12px; font-weight: 700; color: black }
      input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #e5e7eb }
      .primary { height: 44px; border: 0; border-radius: 10px; background: #111; color: #fff; font-weight: 700 }
    `}</style>
  </div>
  );
}
