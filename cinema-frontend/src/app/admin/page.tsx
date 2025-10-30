"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function AdminPage() {
    const [userType, setUserType] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window === "undefined") return;

        const meta = localStorage.getItem("auth_meta");
        if (meta) {
            try {
                const parsedMeta = JSON.parse(meta);
                setUserType(parsedMeta.type || null);
                if (parsedMeta.type !== "admin") {
                    router.push("/");
                }
            } catch {
                router.push("/");
            }
        } else {
            router.push("/");;
        }
    }, [router]);

    if (userType !== "admin") return <div>Loading...</div>;

    return (
        <div className="page">
            <Navbar />
            <main className="content">
                <h1 className="title">Admin Dashboard</h1>
                <p>Welcome, Admin! Use this page to manage the site.</p>
            </main>

            <style jsx>{`
                .page {
                    min-height: 100svh;
                    background: #fff;
                    color: #0b0b0b;
                    display: flex;
                    flex-direction: column;
                }
                .content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 48px 24px;
                    text-align: center;
                }
                .title {
                    font-size: 40px;
                    font-weight: 800;
                    margin-bottom: 24px;
                    color: #111;
                }
                p {
                    font-size: 18px;
                    color: #333;
                }
            `}</style>
        </div>
    );
}
