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

    return value;
};

type PaymentOptionId = "saved1" | "saved2" | "new";

const SAVED_METHODS = [
    { id: "saved1", label: "Visa •••• 4242", detail: "Expires 12/27" },
    { id: "saved2", label: "Mastercard •••• 8899", detail: "Expires 05/26" },
] as const;

export default function CheckoutPage() {
    const [booking, setBooking] = useState<BookingSummary | null>(null);
    const [seats, setSeats] = useState<string[]>([]);
    const [promoCode, setPromoCode] = useState("");
    const [appliedCode, setAppliedCode] = useState<string | null>(null);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [paymentOption, setPaymentOption] =
        useState<PaymentOptionId>("saved1");

    useEffect(() => {
        const stored = localStorage.getItem("booking_summary");
        const storedSeats = localStorage.getItem("selected_seats");
        if (stored) setBooking(JSON.parse(stored));
        if (storedSeats) setSeats(JSON.parse(storedSeats));
    }, []);

    const adults = booking?.tickets.adults ?? 0;
    const children = booking?.tickets.children ?? 0;
    const seniors = booking?.tickets.seniors ?? 0;
    const totalTickets = adults + children + seniors;

    const baseTotal = booking?.total ?? 0;
    const datePretty = formatPrettyDate(booking?.date);

    let discount = 0;
    if (appliedCode === "SAVE10") discount = baseTotal * 0.1;
    if (appliedCode === "FIVEOFF") discount = 5;
    if (discount > baseTotal) discount = baseTotal;

    const finalTotal = baseTotal - discount;

    const applyPromo = () => {
        const code = promoCode.trim().toUpperCase();
        if (code === "SAVE10" || code === "FIVEOFF") {
            setAppliedCode(code);
            setPromoError(null);
        } else {
            setAppliedCode(null);
            setPromoError("Invalid promo code.");
        }
    };

    const placeOrder = () => {
        alert(
            `Mock order placed!\n\nMovie: ${booking?.movie}\nSeats: ${seats.join(
                ", "
            )}\nTotal Charged: $${finalTotal.toFixed(2)}`
        );
    };

    return (
        <div
            style={{
                backgroundColor: "#fff",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
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
                }}
            >
                Checkout
            </h1>

            {/* TWO COLUMN LAYOUT */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                    maxWidth: "1000px",
                    margin: "20px auto",
                    padding: "0 20px",
                    gap: "20px",
                }}
            >
                {/* LEFT SIDE — MOVIE + TICKETS + TOTAL */}
                <div style={{ flex: 1, minWidth: "300px" }}>
                    <div
                        style={{
                            backgroundColor: "#f6f6f6",
                            padding: "20px",
                            borderRadius: "14px",
                            border: "2px solid #000",
                            boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "18px",
                                fontWeight: "bold",
                                marginBottom: "10px",
                            }}
                        >
                            Order Summary
                        </h2>

                        <p><strong>Movie:</strong> {booking?.movie}</p>
                        <p><strong>Showtime:</strong> {booking?.showtime}</p>
                        <p><strong>Date:</strong> {datePretty}</p>
                        <p><strong>Showroom:</strong> {booking?.showroom}</p>
                        <p><strong>Tickets:</strong> {totalTickets}</p>
                        <p><strong>Seats:</strong> {seats.join(", ")}</p>

                        <hr style={{ margin: "10px 0" }} />

                        <p
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <span>Base Total:</span>
                            <strong>${baseTotal.toFixed(2)}</strong>
                        </p>

                        <p
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                color: discount ? "#16a34a" : "#555",
                            }}
                        >
                            <span>Discount:</span>
                            <strong>-${discount.toFixed(2)}</strong>
                        </p>

                        <p
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "18px",
                                marginTop: "10px",
                            }}
                        >
                            <span>Total:</span>
                            <strong>${finalTotal.toFixed(2)}</strong>
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE — PROMO + PAYMENT */}
                <div style={{ flex: 1, minWidth: "300px" }}>
                    {/* PROMO CODE */}
                    <div
                        style={{
                            backgroundColor: "#f9f9f9",
                            padding: "20px",
                            borderRadius: "10px",
                            border: "1px solid #ccc",
                            marginBottom: "20px",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "16px",
                                fontWeight: "bold",
                                marginBottom: "10px",
                                textAlign: "center",
                            }}
                        >
                            Promo Code
                        </h3>

                        <div style={{ display: "flex", gap: "8px" }}>
                            <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                placeholder="SAVE10, FIVEOFF"
                                style={{
                                    flex: 1,
                                    padding: "8px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                }}
                            />
                            <button
                                onClick={applyPromo}
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: "6px",
                                    backgroundColor: "#000",
                                    color: "white",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                }}
                            >
                                Apply
                            </button>
                        </div>

                        {promoError && (
                            <p style={{ color: "red", marginTop: "5px" }}>
                                {promoError}
                            </p>
                        )}

                        {appliedCode && (
                            <p style={{ color: "green", marginTop: "5px" }}>
                                Promo {appliedCode} applied!
                            </p>
                        )}
                    </div>

                    {/* PAYMENT METHODS */}
                    <div
                        style={{
                            backgroundColor: "#f9f9f9",
                            padding: "20px",
                            borderRadius: "10px",
                            border: "1px solid #ccc",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "16px",
                                fontWeight: "bold",
                                marginBottom: "10px",
                                textAlign: "center",
                            }}
                        >
                            Payment Method
                        </h3>

                        {SAVED_METHODS.map((method) => (
                            <label
                                key={method.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "8px",
                                    marginBottom: "6px",
                                    border:
                                        paymentOption === method.id
                                            ? "2px solid #000"
                                            : "1px solid #ddd",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                }}
                            >
                                <input
                                    type="radio"
                                    name="payment-method"
                                    checked={paymentOption === method.id}
                                    onChange={() =>
                                        setPaymentOption(method.id)
                                    }
                                />
                                <div>
                                    <div>{method.label}</div>
                                    <div style={{ fontSize: "12px", opacity: 0.7 }}>
                                        {method.detail}
                                    </div>
                                </div>
                            </label>
                        ))}

                        {/* NEW CARD OPTION */}
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px",
                                border:
                                    paymentOption === "new"
                                        ? "2px solid #000"
                                        : "1px solid #ddd",
                                borderRadius: "8px",
                                cursor: "pointer",
                            }}
                        >
                            <input
                                type="radio"
                                name="payment-method"
                                checked={paymentOption === "new"}
                                onChange={() => setPaymentOption("new")}
                            />
                            Use a new card
                        </label>

                        {paymentOption === "new" && (
                            <div style={{ marginTop: "10px" }}>
                                <input
                                    type="text"
                                    placeholder="Name on card"
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        marginBottom: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Card number"
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        marginBottom: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                    }}
                                />
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        style={{
                                            flex: 1,
                                            padding: "8px",
                                            borderRadius: "6px",
                                            border: "1px solid #ccc",
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="CVC"
                                        style={{
                                            flex: 1,
                                            padding: "8px",
                                            borderRadius: "6px",
                                            border: "1px solid #ccc",
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* PLACE ORDER */}
                        <button
                            onClick={placeOrder}
                            style={{
                                marginTop: "20px",
                                width: "100%",
                                padding: "12px",
                                backgroundColor: "#000",
                                color: "white",
                                borderRadius: "8px",
                                fontWeight: "bold",
                                fontSize: "16px",
                                cursor: "pointer",
                            }}
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
