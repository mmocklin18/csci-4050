"use client";
import { useMemo, useRef, useState } from "react";

export type AuthMode = "login" | "signup";

export interface AuthFormProps {
    initialMode?: AuthMode;
    showTabs?: boolean;
    onSuccess?: (result: { token?: string; user?: unknown; raw: any }) => void;
    onClose?: () => void;
    apiBase?: string;
    compact?: boolean;
}

export default function AuthForm({
                                     initialMode = "login",
                                     showTabs = true,
                                     onSuccess,
                                     onClose,
                                     apiBase,
                                     compact = false,
                                 }: AuthFormProps) {
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passRef = useRef<HTMLInputElement>(null);

    const API_BASE = useMemo(
        () =>
            apiBase ||
            process.env.NEXT_PUBLIC_API_BASE ||
            process.env.API_BASE ||
            process.env.API_BASE_URL ||
            "",
        [apiBase]
    );

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        const payload: Record<string, string> = {
            email: emailRef.current?.value?.trim() || "",
            password: passRef.current?.value || "",
        };
        if (mode === "signup") payload.name = nameRef.current?.value?.trim() || "";

        try {
            const url =
                mode === "signup"
                    ? `${API_BASE}/auth/register`
                    : `${API_BASE}/auth/login`;

            const res = await fetch(url, {
                method: "POST",
                headers: { "content-type": "application/json", accept: "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const msg =
                    typeof data?.detail === "string"
                        ? data.detail
                        : data?.message || "Authentication failed";
                setErr(msg);
                return;
            }

            const token = data.token || data.accessToken || data.access_token;
            if (token) localStorage.setItem("auth_token", token);
            if (data.user) localStorage.setItem("auth_user", JSON.stringify(data.user));

            onSuccess?.({ token, user: data.user, raw: data });
            onClose?.();
        } catch (ex: any) {
            setErr(ex?.message || "Network error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={`card ${compact ? "compact" : ""}`}>
            {showTabs && (
                <div className="segmented">
                    <button
                        type="button"
                        className={`segBtn ${mode === "login" ? "active" : ""}`}
                        onClick={() => setMode("login")}
                    >
                        Log in
                    </button>
                    <button
                        type="button"
                        className={`segBtn ${mode === "signup" ? "active" : ""}`}
                        onClick={() => setMode("signup")}
                    >
                        Sign up
                    </button>
                </div>
            )}

            <h3 className="title">{mode === "login" ? "Welcome back" : "Create your account"}</h3>

            {err && (
                <div className="alert">
                    <span>{err}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="form">
                {mode === "signup" && (
                    <label className="field">
                        <span className="label">Name</span>
                        <input ref={nameRef} placeholder="Jane Doe" required />
                    </label>
                )}

                <label className="field">
                    <span className="label">Email</span>
                    <input ref={emailRef} type="email" placeholder="you@example.com" required />
                </label>

                <label className="field">
                    <span className="label">Password</span>
                    <input ref={passRef} type="password" placeholder="••••••••" minLength={6} required />
                </label>

                <button className="primary" disabled={loading}>
                    {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
                </button>
            </form>

            <style jsx>{`
                .card {
                    width: min(92vw, 460px);
                    background: #ffffff;
                    border: 1px solid #ececec;
                    border-radius: 16px;
                    padding: 22px;
                    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.12);
                }
                .card.compact {
                    padding: 16px;
                    border-radius: 14px;
                }

                /* segmented tabs */
                .segmented {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    background: #f5f5f6;
                    border: 1px solid #e8e8ea;
                    border-radius: 12px;
                    padding: 6px;
                    margin-bottom: 10px;
                }
                .segBtn {
                    border: 0;
                    background: transparent;
                    border-radius: 10px;
                    padding: 10px 12px;
                    font-weight: 700;
                    color: #444;
                    cursor: pointer;
                    transition: background 0.15s ease, color 0.15s ease;
                }
                .segBtn.active {
                    background: #111;
                    color: #fff;
                }

                .title {
                    margin: 6px 0 14px;
                    font-size: 20px;
                    font-weight: 800;
                    letter-spacing: 0.1px;
                }

                .alert {
                    background: #fef2f2;
                    color: #991b1b;
                    border: 1px solid #fecaca;
                    border-radius: 10px;
                    padding: 10px 12px;
                    margin-bottom: 10px;
                    font-size: 14px;
                }

                .form {
                    display: grid;
                    gap: 12px;
                }

                .field {
                    display: grid;
                    gap: 6px;
                }
                .label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #3f3f46;
                    letter-spacing: 0.2px;
                }
                input {
                    width: 100%;
                    border: 1px solid #e5e7eb;
                    background: #fff;
                    padding: 11px 12px;
                    border-radius: 12px;
                    outline: none;
                    font-size: 14px;
                    transition: box-shadow 0.15s ease, border-color 0.15s ease;
                }
                input::placeholder {
                    color: #9ca3af;
                }
                input:focus {
                    border-color: #111;
                    box-shadow: 0 0 0 4px rgba(17, 17, 17, 0.07);
                }

                .primary {
                    margin-top: 4px;
                    width: 100%;
                    height: 44px;
                    border: 0;
                    border-radius: 12px;
                    background: #111; /* match navbar */
                    color: #fff;
                    font-weight: 800;
                    letter-spacing: 0.2px;
                    cursor: pointer;
                    transition: transform 0.05s ease, box-shadow 0.15s ease, opacity 0.15s;
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
                }
                .primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.22);
                }
                .primary:disabled {
                    opacity: 0.65;
                    cursor: default;
                    transform: none;
                    box-shadow: none;
                }
            `}</style>
        </div>
    );
}
