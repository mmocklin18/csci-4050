"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import AuthForm from "@/components/AuthForm";

type BookingSummary = {
    movie: string | null;
    showtime: string | null;
    date: string | null;
    tickets: {
        adults: number;
        children: number;
        seniors: number;
    };
    total: number;
    showroom?: string;
    showId?: string | null;
};

type ApiPrice = {
    type: string;
    amount: number;
};

type Prices = {
    adult: number;
    child: number;
    senior: number;
};

const formatPrettyDate = (value: string | null | undefined): string => {
    if (!value) return "";
    let datePart = value.trim();

    if (datePart.includes("T")) {
        datePart = datePart.split("T")[0];
    } else if (datePart.includes(" ")) {
        datePart = datePart.split(" ")[0];
    }

    const parts = datePart.split("-");
    if (parts.length === 3) {
        const [y, m, d] = parts.map(Number);
        if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
            const jsDate = new Date(y, m - 1, d);
            return jsDate.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }
    }

    const jsDate = new Date(value);
    if (!Number.isNaN(jsDate.getTime())) {
        return jsDate.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    return value;
};

const formatShowtime = (value: string | null | undefined): string => {
    if (!value) return "";

    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
        return d.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        });
    }

    if (value.includes("T")) {
        const timePart = value.split("T")[1] ?? "";
        return timePart.split(" ")[0];
    }
    if (value.includes(" ")) {
        const parts = value.split(" ");
        return parts[1] || value;
    }

    return value;
};

const getShowroomLabel = (showroomId?: string): string => {
    if (!showroomId) return "Not specified";

    if (["1", "2", "3"].includes(showroomId.trim())) {
        return showroomId.trim();
    }

    const match = showroomId.match(/\d+/);
    return match ? match[0] : "Not specified";
};

export default function BookingSummaryPage() {
    const [booking, setBooking] = useState<BookingSummary | null>(null);
    const [seats, setSeats] = useState<string[]>([]);
    const [selectedTheater, setSelectedTheater] = useState<string | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const [prices, setPrices] = useState<Prices | null>(null);
    const [pricesLoading, setPricesLoading] = useState(true);
    const [pricesError, setPricesError] = useState<string | null>(null);

    useEffect(() => {
        const storedBooking = localStorage.getItem("booking_summary");
        const storedSeats = localStorage.getItem("selected_seats");
        const storedTheater = localStorage.getItem("selected_theater");

        if (storedBooking) {
            try {
                setBooking(JSON.parse(storedBooking));
            } catch {
                // ignore parse errors
            }
        }

        if (storedSeats) {
            try {
                setSeats(JSON.parse(storedSeats));
            } catch {
                // ignore parse errors
            }
        }

        if (storedTheater) {
            setSelectedTheater(storedTheater);
        }

        if (storedTheater) {
            setSelectedTheater(storedTheater);
        }
    }, []);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setPricesLoading(true);
                setPricesError(null);

                const res = await fetch("/api/prices", { cache: "no-store" });
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const data: ApiPrice[] = await res.json();
                if (!alive) return;

                const normalized: Prices = {
                    adult: 0,
                    child: 0,
                    senior: 0,
                };

                for (const row of data) {
                    const key = row.type.toLowerCase();
                    if (key === "adult") normalized.adult = row.amount;
                    if (key === "child") normalized.child = row.amount;
                    if (key === "senior") normalized.senior = row.amount;
                }

                setPrices(normalized);
            } catch (err: unknown) {
                if (!alive) return;
                setPricesError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load prices"
                );
            } finally {
                if (alive) setPricesLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    const ADULT_PRICE = prices?.adult ?? 0;
    const CHILD_PRICE = prices?.child ?? 0;
    const SENIOR_PRICE = prices?.senior ?? 0;

    const adults = booking?.tickets.adults ?? 0;
    const children = booking?.tickets.children ?? 0;
    const seniors = booking?.tickets.seniors ?? 0;

    const adultSubtotal = adults * ADULT_PRICE;
    const childSubtotal = children * CHILD_PRICE;
    const seniorSubtotal = seniors * SENIOR_PRICE;
    const totalTickets = adults + children + seniors;

    const computedTotal = adultSubtotal + childSubtotal + seniorSubtotal;
    const finalTotal = booking?.total ?? computedTotal;

    const formattedDate = formatPrettyDate(booking?.date);
    const formattedShowtime = formatShowtime(booking?.showtime);
    const showroomLabel = getShowroomLabel(booking?.showroom);

    const handleContinueClick = () => {
        const token =
            localStorage.getItem("auth_token") ||
            localStorage.getItem("token");

        if (token) {
            window.location.href = "/checkout";
        } else {
            setShowAuthModal(true);
        }
    };

    const closeAuthModal = () => setShowAuthModal(false);

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
                Booking Summary
            </h1>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingBottom: "40px",
                }}
            >

                <div
                    style={{
                        backgroundColor: "#f6f6f6",
                        padding: "18px 24px",
                        borderRadius: "14px",
                        border: "2px solid #000",
                        width: "90%",
                        maxWidth: "420px",
                        margin: "0 auto 20px",
                        boxShadow: "0 6px 18px rgba(0, 0, 0, 0.18)",
                        textAlign: "center",
                        lineHeight: "1.6",
                    }}
                >
                    <div style={{ fontSize: "16px", marginBottom: "6px" }}>
                        <strong>Movie:</strong>{" "}
                        {booking?.movie ?? "Not specified"}
                    </div>

                    <div style={{ fontSize: "16px", marginBottom: "6px" }}>
                        <strong>Showtime:</strong>{" "}
                        {formattedShowtime || "Not specified"}
                    </div>

                    <div style={{ fontSize: "16px", marginBottom: "6px" }}>
                        <strong>Date:</strong>{" "}
                        {formattedDate || "Not specified"}
                    </div>

                    <div style={{ fontSize: "16px" }}>
                        <strong>Showroom:</strong> {showroomLabel}
                    </div>
                </div>

                {pricesLoading && (
                    <p style={{ color: "#555", marginBottom: "8px" }}>
                        Loading ticket prices…
                    </p>
                )}
                {pricesError && (
                    <p style={{ color: "#b91c1c", marginBottom: "8px" }}>
                        Could not load prices. Showing $0.00 until refreshed.
                    </p>
                )}

                <div
                    style={{
                        backgroundColor: "#f9f9f9",
                        padding: "16px 20px",
                        borderRadius: "10px",
                        border: "1px solid #ccc",
                        width: "90%",
                        maxWidth: "420px",
                        marginBottom: "16px",
                        boxShadow: "0 3px 10px rgba(0, 0, 0, 0.12)",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            marginBottom: "10px",
                            textAlign: "center",
                            color: "#111",
                        }}
                    >
                        Tickets
                    </h2>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            fontSize: "14px",
                            color: "#222",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <span>
                                Adults ({adults} × ${ADULT_PRICE.toFixed(2)})
                            </span>
                            <span>${adultSubtotal.toFixed(2)}</span>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <span>
                                Children ({children} × $
                                {CHILD_PRICE.toFixed(2)})
                            </span>
                            <span>${childSubtotal.toFixed(2)}</span>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <span>
                                Seniors ({seniors} × ${SENIOR_PRICE.toFixed(2)})
                            </span>
                            <span>${seniorSubtotal.toFixed(2)}</span>
                        </div>

                        <div
                            style={{
                                height: "1px",
                                backgroundColor: "#ddd",
                                margin: "8px 0",
                            }}
                        />

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontWeight: "bold",
                            }}
                        >
                            <span>Total Tickets</span>
                            <span>{totalTickets}</span>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontWeight: "bold",
                                marginTop: "4px",
                            }}
                        >
                            <span>Total Cost</span>
                            <span>${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>


                <div
                    style={{
                        backgroundColor: "#f9f9f9",
                        padding: "16px 20px",
                        borderRadius: "10px",
                        border: "1px solid #ccc",
                        width: "90%",
                        maxWidth: "420px",
                        boxShadow: "0 3px 10px rgba(0, 0, 0, 0.12)",
                        marginBottom: "24px",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            marginBottom: "8px",
                            textAlign: "center",
                            color: "#111",
                        }}
                    >
                        Selected Seat(s)
                    </h2>

                    {seats.length === 0 ? (
                        <p
                            style={{
                                textAlign: "center",
                                fontSize: "14px",
                                color: "#555",
                            }}
                        >
                            No seats selected.
                        </p>
                    ) : (
                        <p
                            style={{
                                textAlign: "center",
                                fontSize: "14px",
                                color: "#222",
                            }}
                        >
                            {seats.join(", ")}
                        </p>
                    )}
                </div>

                <button
                    onClick={handleContinueClick}
                    style={{
                        padding: "10px 24px",
                        backgroundColor: "#000000ff",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginBottom: "40px",
                    }}
                >
                    Continue to Checkout
                </button>
            </div>

            {showAuthModal && (
                <div
                    onClick={closeAuthModal}
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.45)",
                        zIndex: 2000,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >

                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >

                        <div
                            style={{
                                backgroundColor: "#fff",
                                padding: "10px 24px",
                                borderRadius: "12px",
                                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                                fontWeight: "600",
                                fontSize: "14px",
                                textAlign: "center",
                                color: "#FF0000"
                            }}
                        >
                            Please log in to continue
                        </div>

                        <AuthForm />
                    </div>
                </div>
            )}
        </div>
    );
}
