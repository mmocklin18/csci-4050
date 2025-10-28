"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uid = searchParams.get("uid");
  const ts = searchParams.get("ts");
  const sig = searchParams.get("sig");
  const purpose = searchParams.get("purpose") ?? "password_reset";

  const API_BASE = useMemo(
    () =>
      process.env.NEXT_PUBLIC_API_BASE ||
      process.env.API_BASE ||
      process.env.API_BASE_URL ||
      "",
    []
  );

  const linkInvalid = !uid || !ts || !sig;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (linkInvalid) return;
    setError(null);
    setMessage(null);

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          uid: Number(uid),
          ts: Number(ts),
          sig,
          purpose,
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data?.detail === "string" ? data.detail : data?.message || "Unable to reset password."
        );
        return;
      }

      setMessage(data?.message || "Password updated! You can now log in.");
      setPassword("");
      setConfirm("");
      setTimeout(() => router.push("/"), 2500);
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pageWrap">
      <div className="card">
        <h3 className="title">Reset your password</h3>
        {linkInvalid ? (
          <div className="alert error">This reset link is invalid or missing required information.</div>
        ) : (
          <>
            <p className="subtitle">
              Choose a new password for your account. Your link expires shortly, so finish the reset soon.
            </p>
            {error && <div className="alert error">{error}</div>}
            {message && <div className="alert success">{message}</div>}

            <form onSubmit={handleSubmit} className="form">
              <label className="field">
                <span className="label">New password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  placeholder="At least 8 characters"
                  required
                />
              </label>
              <label className="field">
                <span className="label">Confirm password</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={8}
                  placeholder="Repeat your password"
                  required
                />
              </label>

              <button className="primary" disabled={loading}>
                {loading ? "Resetting…" : "Reset password"}
              </button>
            </form>
          </>
        )}

        <Link href="/" className="link">
          Back to home
        </Link>
      </div>

      <style jsx>{`
        .pageWrap {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
        }
        .card {
          width: min(92vw, 420px);
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #ececec;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
          display: grid;
          gap: 16px;
        }
        .title {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
        }
        .subtitle {
          margin: 0;
          color: #4b5563;
        }
        .alert {
          padding: 10px 12px;
          border-radius: 8px;
        }
        .alert.error {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }
        .alert.success {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #d1fae5;
        }
        .form {
          display: grid;
          gap: 14px;
        }
        .field {
          display: grid;
          gap: 6px;
        }
        .label {
          font-size: 12px;
          font-weight: 700;
          color: #374151;
        }
        input {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
        }
        .primary {
          height: 44px;
          border-radius: 10px;
          background: #111827;
          color: white;
          border: none;
          font-weight: 700;
          cursor: pointer;
        }
        .primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .link {
          text-align: center;
          color: #2563eb;
          text-decoration: none;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
