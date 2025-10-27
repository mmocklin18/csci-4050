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
    onForgotPassword?: () => void;
}

export default function AuthForm({
                                     initialMode = "login",
                                     showTabs = true,
                                     onSuccess,
                                     onClose,
                                     apiBase,
                                     compact = false,
                                     onForgotPassword,
                                 }: AuthFormProps) {
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [promoOptIn, setPromoOptIn] = useState(false);
    const [userType, setUserType] = useState<string>("customer");
    // typeRef removed — we'll use controlled select bound to `userType`


    // refs
    const firstRef = useRef<HTMLInputElement>(null);
    const lastRef  = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passRef  = useRef<HTMLInputElement>(null);

    const API_BASE = useMemo(
        () =>
            apiBase ||
            process.env.NEXT_PUBLIC_API_BASE ||
            process.env.API_BASE ||
            process.env.API_BASE_URL ||
            "",
        [apiBase]
    );

    const url = `${API_BASE}/auth/signup`;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        try {
            let url = "";
            let body: any = {};

            if (mode === "signup") {
                url = `${API_BASE}/auth/signup`;
                body = {
                    first_name: firstRef.current?.value?.trim() || "",
                    last_name:  lastRef.current?.value?.trim()  || "",
                    email:      emailRef.current?.value?.trim() || "",
                    password:   passRef.current?.value || "",
                    type:       userType || "customer",
                    // NOTE: promotional_emails is NOT in the backend schema; don’t send it
                };
            } else {
                url = `${API_BASE}/auth/login`;
                body = {
                    email:    emailRef.current?.value?.trim() || "",
                    password: passRef.current?.value || "",
                };
            }

            const res = await fetch(url, {
                method: "POST",
                headers: { "content-type": "application/json", accept: "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setErr(typeof data?.detail === "string" ? data.detail : data?.message || "Request failed");
                return;
            }

            const token = data.access_token || data.token || data.accessToken;
            if (token) localStorage.setItem("auth_token", token);
            // You can also tuck away userType/promo locally if you want
            localStorage.setItem("auth_meta", JSON.stringify({ type: userType, promoOptIn }));

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

            {err && <div className="alert">{err}</div>}

            <form onSubmit={handleSubmit} className="form">
                {mode === "signup" && (
                    <>
                        <div className="row2">
                            <label className="field">
                                <span className="label">First name<span className="required">*</span></span>
                                <input ref={firstRef} placeholder="Jane" required />
                            </label>
                            <label className="field">
                                <span className="label">Last name<span className="required">*</span></span>
                                <input ref={lastRef} placeholder="Doe" required />
                            </label>
                        </div>

                        <label className="field">
                            <span className="label">Account Type<span className="required">*</span></span>
                            <select
                                required
                                value={userType}
                                onChange={(e) => setUserType(e.target.value)}
                            >
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </label>
                    </>
                )}

                <label className="field">
                    <span className="label">Email<span className="required">*</span></span>
                    <input ref={emailRef} type="email" placeholder="you@example.com" required />
                </label>

                <label className="field">
                    <span className="label">Password<span className="required">*</span></span>
                    <input ref={passRef} type="password" placeholder="••••••••" minLength={6} required />
                </label>

                {mode === "login" && (
                    <div className="rowBetween">
                        <button
                            type="button"
                            className="linkBtn"
                            onClick={() => {
                                if (onForgotPassword) return onForgotPassword();
                                window.location.href = "/forgot-password";
                            }}
                        >
                            Forgot my password
                        </button>
                    </div>
                )}

                {mode === "signup" && (
                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={promoOptIn}
                            onChange={(e) => setPromoOptIn(e.target.checked)}
                        />
                        <span>Send me promotional emails</span>
                    </label>
                )}

                <button className="primary" disabled={loading}>
                    {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
                </button>
            </form>

            <style jsx>{`
                .card {
                    width: min(92vw, 460px);
                    background: #fff;
                    border: 1px solid #ececec;
                    border-radius: 16px;
                    padding: 22px;
                    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.12);
                }
                .card.compact {
                    padding: 16px;
                    border-radius: 14px;
                }

                .segmented {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    background: #f5f5f6;
                    border: 1px solid #e8e8ea;
                    border-radius: 12px;
                    padding: 6px;
                    margin-bottom: 12px;
                }
                .segBtn {
                    border: 0;
                    background: transparent;
                    border-radius: 10px;
                    padding: 10px 12px;
                    font-weight: 700;
                    color: #444;
                    cursor: pointer;
                    transition: background 0.15s, color 0.15s;
                }
                .segBtn.active {
                    background: #111;
                    color: #fff;
                }

                .title {
                    margin: 6px 0 14px;
                    font-size: 20px;
                    font-weight: 800;
                }

                .alert {
                    background: #fef2f2;
                    color: #991b1b;
                    border: 1px solid #fecaca;
                    border-radius: 10px;
                    padding: 10px 12px;
                    margin-bottom: 12px;
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
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .required {
                    color: #dc2626; 
                    font-size: 14px;
                    line-height: 1;
                }

                .checkbox {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #444;
                }
                .checkbox input {
                    width: 16px;
                    height: 16px;
                    accent-color: #111;
                }

                input {
                    width: 100%;
                    border: 1px solid #e5e7eb;
                    background: #fff;
                    padding: 11px 12px;
                    border-radius: 12px;
                    outline: none;
                    font-size: 14px;
                    transition: box-shadow 0.15s, border-color 0.15s;
                }
                input::placeholder {
                    color: #9ca3af;
                }
                input:focus {
                    border-color: #111;
                    box-shadow: 0 0 0 4px rgba(17, 17, 17, 0.07);
                }
                select {
                    width: 100%;
                    border: 1px solid #e5e7eb;
                    background: #fff;
                    padding: 11px 12px;
                    border-radius: 12px;
                    font-size: 14px;
                    outline: none;
                    transition: box-shadow .15s, border-color .15s;
                }
                select:focus {
                    border-color: #111;
                    box-shadow: 0 0 0 4px rgba(17,17,17,.07);
                }
                .required {
                    color: red;
                    margin-left: 3px;
                }
                .primary {
                    margin-top: 4px;
                    width: 100%;
                    height: 44px;
                    border: 0;
                    border-radius: 12px;
                    background: #111;
                    color: #fff;
                    font-weight: 800;
                    letter-spacing: 0.2px;
                    cursor: pointer;
                    transition: transform 0.05s, box-shadow 0.15s, opacity 0.15s;
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
                }
                .primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.22);
                }
                .primary:disabled {
                    opacity: 0.65;
                    transform: none;
                    box-shadow: none;
                    cursor: default;
                }
                .rowBetween {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: -4px;
                    margin-bottom: 4px;
                }

                .linkBtn {
                    background: transparent;
                    border: 0;
                    padding: 0;
                    color: #2563eb;           
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    text-decoration: underline;
                }
                .linkBtn:hover { opacity: 0.85; }
            `}</style>
        </div>
    );
}
