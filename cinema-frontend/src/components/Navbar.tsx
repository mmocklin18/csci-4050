"use client";
import { useEffect, useState } from "react";

export default function Navbar() {
    const [authed, setAuthed] = useState(false);

    useEffect(() => {
        const token = typeof window !== "undefined" && localStorage.getItem("auth_token");
        setAuthed(Boolean(token));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        window.location.reload();
    };

    const [open, setOpen] = useState(false);
    const show = () => setOpen(true);
    const hide = () => setOpen(false);

    return (
        <>
            <header className="navbar">
                <div className="brand">BookMyShow</div>

                <div className="authBtns">
                    {!authed ? (
                        <button onClick={show} className="authBtn">
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
                <div className="modalBackdrop" onClick={(e) => e.target === e.currentTarget && hide()}>
                    <div className="modalCard">
                        <button onClick={hide} className="closeBtn">✕</button>
                        <h2>Auth Modal Placeholder</h2>
                        <p>Here’s where your login/signup modal goes.</p>
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
        }
        .authBtn:hover {
          background: #fff;
          color: #000;
        }
        .modalBackdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: grid;
          place-items: center;
          z-index: 1000;
        }
        .modalCard {
          background: white;
          padding: 24px;
          border-radius: 12px;
          text-align: center;
          max-width: 400px;
        }
        .closeBtn {
          border: none;
          background: transparent;
          font-size: 18px;
          cursor: pointer;
          position: absolute;
          top: 10px;
          right: 16px;
        }
      `}</style>
        </>
    );
}
