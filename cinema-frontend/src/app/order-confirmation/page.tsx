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
    showroom?: string;
    showId?: string | null;

    discountedTotal?: number;
    promoUsed?: string | null;
    seats?: string[];
};

const formatPrettyDate = (value: string | null | undefined): string => {
    if (!value) return "";
    let datePart = value.trim();
    if (datePart.includes("T")) datePart = datePart.split("T")[0];
    else if (datePart.includes(" ")) datePart = datePart.split(" ")[0];

    const parts = datePart.split("-");
    if (parts.length === 3) {
        const [y, m, d] = parts.map(Number);
        const jsDate = new Date(y, m - 1, d);
        if (!Number.isNaN(jsDate.getTime())) {
            return jsDate.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }
    }
    return value ?? "";
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
    if (value.includes("T")) return value.split("T")[1]?.substring(0, 5) ?? value;
    if (value.includes(" ")) return value.split(" ")[1] ?? value;
    return value;
};

const getShowroomLabel = (room?: string): string => {
    if (!room) return "Not specified";
    const match = room.match(/\d+/);
    return match ? match[0] : "Not specified";
};

export default function OrderConfirmationPage() {
    const [booking, setBooking] = useState<BookingSummary | null>(null);
    const [orderNumber, setOrderNumber] = useState<string>("");

    useEffect(() => {
        const storedBooking = localStorage.getItem("booking_summary");
        if (storedBooking) setBooking(JSON.parse(storedBooking));

        const generatedOrderId = "ORD-" + Math.floor(Math.random() * 900000 + 100000);
        setOrderNumber(generatedOrderId);
    }, []);

    if (!booking) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <Navbar />
                <h1>Order Not Found</h1>
                <p>Please complete a booking first.</p>
            </div>
        );
    }

    const formattedDate = formatPrettyDate(booking.date);
    const formattedShowtime = formatShowtime(booking.showtime);
    const showroomLabel = getShowroomLabel(booking.showroom);

    const { adults, children, seniors } = booking.tickets;
    const finalPaid = booking.discountedTotal ?? booking.total;
    const seats = booking.seats ?? [];

    return (
        <div
            style={{
                backgroundColor: "#fff",
                position: "fixed",
                inset: 0,
                margin: 0,
                overflowY: "auto",
            }}
        >
            <Navbar />

            <h1
                style={{
                    marginTop: "30px",
                    fontSize: "26px",
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: "8px",
                }}
            >
                Thank You for Your Purchase!
            </h1>

            <p style={{ textAlign: "center", color: "#444", marginBottom: "20px" }}>
                Your order has been confirmed.
            </p>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

                {/* Order Number */}
                <div
                    style={{
                        padding: "14px 20px",
                        backgroundColor: "#f6f6f6",
                        border: "2px solid #000",
                        borderRadius: "10px",
                        marginBottom: "20px",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.16)",
                    }}
                >
                    <strong>Order Number:</strong> {orderNumber}
                </div>

                {/* Movie + Showtime Box */}
                <div
                    style={{
                        backgroundColor: "#f6f6f6",
                        padding: "18px 24px",
                        borderRadius: "14px",
                        border: "2px solid #000",
                        width: "90%",
                        maxWidth: "420px",
                        marginBottom: "20px",
                        boxShadow: "0 6px 18px rgba(0, 0, 0, 0.18)",
                        textAlign: "center",
                        lineHeight: "1.6",
                    }}
                >
                    <div><strong>Movie:</strong> {booking.movie}</div>
                    <div><strong>Date:</strong> {formattedDate}</div>
                    <div><strong>Showtime:</strong> {formattedShowtime}</div>
                    <div><strong>Showroom:</strong> {showroomLabel}</div>
                </div>

                {/* Tickets Box */}
                <div
                    style={{
                        backgroundColor: "#f9f9f9",
                        padding: "16px 20px",
                        borderRadius: "10px",
                        border: "1px solid #ccc",
                        width: "90%",
                        maxWidth: "420px",
                        marginBottom: "20px",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
                        fontSize: "14px",
                    }}
                >
                    <h2 style={{ textAlign: "center", marginBottom: "10px", fontSize: "16px" }}>
                        Tickets
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Adults: {adults}</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Children: {children}</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Seniors: {seniors}</span>
                        </div>

                        {/* Divider */}
                        <div
                            style={{
                                height: "1px",
                                backgroundColor: "#ddd",
                                margin: "8px 0",
                            }}
                        />

                        {/* Promo row — only shown if promo used */}
                        {booking.promoUsed && (
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    color: "#444",
                                }}
                            >
                                <span>Promo Applied:</span>
                                <span>{booking.promoUsed}</span>
                            </div>
                        )}

                        {/* Final Amount */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontWeight: "bold",
                                marginTop: "6px",
                            }}
                        >
                            <span>Total Paid:</span>
                            <span>${finalPaid.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Seats */}
                <div
                    style={{
                        backgroundColor: "#f9f9f9",
                        padding: "16px 20px",
                        borderRadius: "10px",
                        border: "1px solid #ccc",
                        width: "90%",
                        maxWidth: "420px",
                        boxShadow: "0 3px 10px rgba(0, 0, 0, 0.12)",
                        marginBottom: "40px",
                        textAlign: "center",
                    }}
                >
                    <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>Your Seats</h2>
                    {seats.length === 0 ? (
                        <p style={{ color: "#666" }}>No seats recorded.</p>
                    ) : (
                        <p>{seats.join(", ")}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
