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

type PaymentOptionId = "saved1" | "saved2" | "new";

const SAVED_METHODS = [
    { id: "saved1", label: "Visa •••• 4242", detail: "Expires 12/27" },
    { id: "saved2", label: "Mastercard •••• 8899", detail: "Expires 05/26" },
] as const;

type ApiPromotion = {
    promotions_id: number;
    code: string;
    discount: number;
    start_date: string | null;
    end_date: string | null;
};

export default function CheckoutPage() {
    const [booking, setBooking] = useState<BookingSummary | null>(null);
    const [seats, setSeats] = useState<string[]>([]);

    const [promoCode, setPromoCode] = useState("");
    const [promo, setPromo] = useState<ApiPromotion | null>(null);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [promoLoading, setPromoLoading] = useState(false);

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
    const showtimePretty = formatShowtime(booking?.showtime);

    let discount = 0;
    if (promo && baseTotal > 0) {

        discount = (promo.discount / 100) * baseTotal;

        if (discount > baseTotal) discount = baseTotal;
    }

    const finalTotal = baseTotal - discount;

    const applyPromo = async () => {
        const code = promoCode.trim().toUpperCase();
        if (!code) {
            setPromoError("Please enter a promo code.");
            setPromo(null);
            return;
        }

        setPromoLoading(true);
        setPromoError(null);
        setPromo(null);

        try {
            const res = await fetch(
                `/api/promotions?code=${encodeURIComponent(code)}`,
                { cache: "no-store" }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text}`);
            }

            const promos: ApiPromotion[] = await res.json();

            if (!promos.length) {
                setPromoError("Promo code not found or not active.");
                setPromo(null);
                return;
            }

            setPromo(promos[0]);
        } catch (err) {
            console.error("Failed to apply promo:", err);
            setPromoError("Could not validate promo code.");
            setPromo(null);
        } finally {
            setPromoLoading(false);
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
                        <p><strong>Date:</strong> {datePretty}</p>
                        <p><strong>Showtime:</strong> {showtimePretty}</p>
                        <p><strong>Tickets:</strong> {totalTickets}</p>
                        <p><strong>Showroom:</strong> {booking?.showroom}</p>
                        <p><strong>Seat(s):</strong> {seats.join(", ")}</p>

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
                            <strong>- ${discount.toFixed(2)}</strong>
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

                        {promo && (
                            <p
                                style={{
                                    marginTop: "6px",
                                    fontSize: "13px",
                                    color: "#16a34a",
                                }}
                            >
                                Promo <strong>{promo.code}</strong> (
                                {promo.discount}% off) applied.
                            </p>
                        )}
                    </div>
                </div>

                <div style={{ flex: 1, minWidth: "300px" }}>

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
                                onChange={(e) =>
                                    setPromoCode(e.target.value)
                                }
                                placeholder="Enter Promo Code"
                                style={{
                                    flex: 1,
                                    padding: "8px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                }}
                            />
                            <button
                                onClick={applyPromo}
                                disabled={promoLoading}
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: "6px",
                                    backgroundColor: "#000",
                                    color: "white",
                                    fontWeight: "bold",
                                    cursor: promoLoading
                                        ? "default"
                                        : "pointer",
                                    opacity: promoLoading ? 0.7 : 1,
                                }}
                            >
                                {promoLoading ? "Checking..." : "Apply"}
                            </button>
                        </div>

                        {promoError && (
                            <p style={{ color: "red", marginTop: "5px" }}>
                                {promoError}
                            </p>
                        )}
                    </div>

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
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            opacity: 0.7,
                                        }}
                                    >
                                        {method.detail}
                                    </div>
                                </div>
                            </label>
                        ))}

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