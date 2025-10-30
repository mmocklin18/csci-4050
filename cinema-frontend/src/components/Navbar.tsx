"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";

export default function Navbar() {
    const [authed, setAuthed] = useState(false);
    const [userType, setUserType] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // check auth token
    useEffect(() => {
        if (typeof window === "undefined") return;  
        const token = localStorage.getItem("auth_token");
        const meta = localStorage.getItem("auth_meta");
        setAuthed(Boolean(token));

        if (meta) {
            try {
                const parsedMeta = JSON.parse(meta);
                setUserType(parsedMeta.type || null);
            } catch {
                console.warn("Invalid auth_meta format");
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_meta");
        setAuthed(false);
        setUserType(null);
        router.push("/");
    };

    const handleSuccess = (result?: { token?: string; user?: unknown; raw: any }) => {
        const storedToken =
            typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        const meta = localStorage.getItem("auth_meta");
        const hasToken = Boolean(result?.token || storedToken);
        setAuthed(hasToken);
        if (meta) {
            try {
                const parsedMeta = JSON.parse(meta);
                setUserType(parsedMeta.type || null);
            } catch {
                console.warn("Invalid auth_meta format");
            }   
        }
        setOpen(false);
    };

    return (
        <>
            <header className="navbar">
                <button onClick={() => router.push("/")} className="homeBtn">
                Home
                </button>
                <div className="brand">BookMyShow</div>

                <div className="authBtns">
                    {userType === "admin" && (
                        <span className="adminSection">
                            <span className ="adminLabel">Welcome, Admin!</span>
                                <button
                                    onClick={() => router.push("/admin")}
                                    className="authBtn adminBtn"
                                >
                                    Admin Dashboard
                                </button>
                        </span>
                    )}
                    {authed && userType !== "admin" && (
                        <button
                            onClick={() => router.push("/profile")}
                            className="authBtn"
                        >
                            Profile
                        </button>
                    )}
                    {!authed ? (
                        <button onClick={() => setOpen(true)} className="authBtn">
                            Sign up / Log in
                        </button>
                    ) : (
                        <button onClick={handleLogout} className="authBtn">
                            Log out
                        </button>
                    )}
                </div>
            </header>

            {open && (
                <div
                    className="modalBackdrop"
                    onClick={(e) => e.target === e.currentTarget && setOpen(false)}
                >
                    <div className="modalCard">
                        <AuthForm
                            initialMode="login"
                            onSuccess={handleSuccess}
                            onClose={() => setOpen(false)}
                            onForgotPassword={() => {
                                setOpen(false);
                                router.push("/forgot-password");
                            }}
                        />
                    </div>
                </div>
            )}

            <style jsx>{`
                .navbar {
                    position: relative;
                    height: 64px;
                    background: black;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    padding: 0 24px;
                }

                .brand {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    font-weight: 1000;
                    font-size: 24px;
                    letter-spacing: 0.4px;
                }
                
                .homeBtn {
                    background: transparent;
                    color: #fff;
                    border: 1px solid #fff;
                    border-radius: 8px;
                    padding: 4px 10px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                 }

                .homeBtn:hover {
                    background: #fff;
                    color: #000;
                }
                
                .adminSection {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .adminLabel {
                    font-weight: 600;
                    color: #fefdfdff;
                    font-size: 14px;
                }

                .authBtns {
                    margin-left: auto;
                }

                .authBtn {
                    background: transparent;
                    color: #fff;
                    border: 1px solid #fff;
                    border-radius: 8px;
                    padding: 4px 10px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .authBtn:hover {
                    background: #fff;
                    color: #000;
                }

                .modalBackdrop{
                    position:fixed; inset:0;
                    background:rgba(0,0,0,.45);
                    backdrop-filter:saturate(120%) blur(3px);
                    display:grid; place-items:center; z-index:1000;
                }
                .modalCard{
                    background:#fff; border-radius:18px; padding:0; /* let AuthForm handle padding */
                    box-shadow:0 20px 60px rgba(0,0,0,.25);
                }
                /* wrap AuthForm with a little breathing room */
                .modalCard :global(.card){ margin: 6px; }
            `}</style>
        </>
    );
}
