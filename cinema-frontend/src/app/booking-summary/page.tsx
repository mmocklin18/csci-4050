"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

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
};

export default function BookingSummaryPage() {
    const [booking, setBooking] = useState<BookingSummary | null>(null);
    const [seats, setSeats] = useState<string[]>([]);


    useEffect(() => {
        const storedBooking = localStorage.getItem("booking_summary");
        const storedSeats = localStorage.getItem("selected_seats");

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
    }, []);

    const ADULT_PRICE = 12.0;
    const CHILD_PRICE = 8.0;
    const SENIOR_PRICE = 9.0;

    const adults = booking?.tickets.adults ?? 0;
    const children = booking?.tickets.children ?? 0;
    const seniors = booking?.tickets.seniors ?? 0;

    const adultSubtotal = adults * ADULT_PRICE;
    const childSubtotal = children * CHILD_PRICE;
    const seniorSubtotal = seniors * SENIOR_PRICE;
    const totalTickets = adults + children + seniors;


    const computedTotal = adultSubtotal + childSubtotal + seniorSubtotal;
    const finalTotal = booking?.total ?? computedTotal;

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
                    paddingBottom: "32px",
                }}
            >
                {/* Movie info card */}
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
                        {booking?.showtime ?? "Not specified"}
                    </div>

                    <div style={{ fontSize: "16px" }}>
                        <strong>Date:</strong>{" "}
                        {booking?.date ?? "Not specified"}
                    </div>
                </div>

                {/* Ticket breakdown + total */}
                <div
                    style={{
                        backgroundColor: "#f9f9f9",
                        padding: "16px 20px",
                        borderRadius: "10px",
                        border: "1px solid #ccc",
                        width: "90%",
                        maxWidth: "420px",
                        marginBottom: "16px",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
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

                {/* Seats list */}
                <div
                    style={{
                        backgroundColor: "#f9f9f9",
                        padding: "16px 20px",
                        borderRadius: "10px",
                        border: "1px solid #ccc",
                        width: "90%",
                        maxWidth: "420px",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
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
                        Selected Seats
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
            </div>
        </div>
    );
}
