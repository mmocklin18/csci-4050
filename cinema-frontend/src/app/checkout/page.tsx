"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.API_BASE ||
    process.env.API_BASE_URL ||
    "";

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

const formatTimeOnly = (value: string | null | undefined): string => {
    if (!value) return "";
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
        return d.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        });
    }
    if (value.includes(" ")) {
        const parts = value.split(" ");
        return parts[1] || value;
    }
    return value;
};

type PaymentOptionId = "saved1" | "new";

type ApiPromotion = {
    promotions_id: number;
    code: string;
    discount: number;
    start_date: string | null;
    end_date: string | null;
};

export default function CheckoutPage() {
    const router = useRouter(); 

    const [booking, setBooking] = useState<BookingSummary | null>(null);
    const [seats, setSeats] = useState<string[]>([]);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [cards, setCards] = useState<
        { card_id: number; label: string; detail: string }[]
    >([]);
    const [userHasAddress, setUserHasAddress] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [promo, setPromo] = useState<ApiPromotion | null>(null);
    const [appliedCode, setAppliedCode] = useState<string | null>(null);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [paymentOption, setPaymentOption] = useState<PaymentOptionId>("saved1");
    const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
    const [newCardName, setNewCardName] = useState("");
    const [newCardNumber, setNewCardNumber] = useState("");
    const [newCardExp, setNewCardExp] = useState("");
    const [newCardCvc, setNewCardCvc] = useState("");
    const [billingStreet, setBillingStreet] = useState("");
    const [billingCity, setBillingCity] = useState("");
    const [billingState, setBillingState] = useState("");
    const [billingZip, setBillingZip] = useState("");
    const [placing, setPlacing] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("booking_summary");
        const storedSeats = localStorage.getItem("selected_seats");
        if (stored) setBooking(JSON.parse(stored));
        if (storedSeats) setSeats(JSON.parse(storedSeats));

        const token =
            localStorage.getItem("auth_token") ||
            localStorage.getItem("token");
        const userIdStr = localStorage.getItem("user_id");

        if (!token || !userIdStr) {
            router.replace("/booking-summary?requireLogin=1");
            return;
        }

        const parsedUserId = Number(userIdStr);
        if (Number.isNaN(parsedUserId)) {
            router.replace("/booking-summary?requireLogin=1");
            return;
        }

        setAuthToken(token);
        setUserId(parsedUserId);

        if (API_BASE) {
            Promise.all([
                fetch(`${API_BASE}/cards/user/${parsedUserId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE}/user/`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ])
                .then(async ([cardsRes, userRes]) => {
                    if (cardsRes.ok) {
                        const data: any[] = await cardsRes.json();
                        const formatted = data.map((c) => ({
                            card_id: c.card_id,
                            label: `Card •••• ${String(c.number).slice(-4)}`,
                            detail: `Expires ${new Date(c.exp_date).toLocaleDateString("en-US", {
                                month: "2-digit",
                                year: "2-digit",
                            })}`,
                        }));
                        setCards(formatted);
                        if (formatted.length) {
                            setPaymentOption("saved1");
                            setSelectedCardId(formatted[0].card_id);
                        }
                    }

                    if (userRes.ok) {
                        const userData = await userRes.json();
                        setUserHasAddress(Boolean(userData?.address));
                    }
                })
                .catch((err) => {
                    console.warn("Could not load cards/user", err);
                });
        }
    }, [router]);

    const adults = booking?.tickets.adults ?? 0;
    const children = booking?.tickets.children ?? 0;
    const seniors = booking?.tickets.seniors ?? 0;
    const totalTickets = adults + children + seniors;

    const baseTotal = booking?.total ?? 0;
    const datePretty = formatPrettyDate(booking?.date);
    const timePretty = formatTimeOnly(booking?.showtime);

    let discount = 0;
    if (promo && baseTotal > 0) {
        discount = (promo.discount / 100) * baseTotal;
        if (discount > baseTotal) discount = baseTotal;
    } else if (appliedCode === "SAVE10") {
        discount = Math.min(baseTotal * 0.1, baseTotal);
    } else if (appliedCode === "FIVEOFF") {
        discount = Math.min(5, baseTotal);
    }

    const finalTotal = baseTotal - discount;

    const applyPromo = async () => {
        const code = promoCode.trim().toUpperCase();
        if (!code) {
            setPromoError("Please enter a promo code.");
            setPromo(null);
            setAppliedCode(null);
            return;
        }

        if (code === "SAVE10" || code === "FIVEOFF") {
            setAppliedCode(code);
            setPromo(null);
            setPromoError(null);
            setPromoLoading(false);
            return;
        }

        setPromoLoading(true);
        setPromoError(null);
        setPromo(null);
        setAppliedCode(null);

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

    const placeOrder = async () => {
        if (placing) return;

        if (!booking) {
            alert("Booking details are missing. Please restart checkout.");
            return;
        }

        if (!booking.showId) {
            alert("Showtime information is missing.");
            return;
        }

        if (!seats.length) {
            alert("Please select seats before placing the order.");
            return;
        }

        const token =
            authToken ||
            localStorage.getItem("auth_token") ||
            localStorage.getItem("token");
        const userIdStr = userId !== null ? userId.toString() : localStorage.getItem("user_id");
        const userIdNum = userId !== null ? userId : userIdStr ? Number(userIdStr) : NaN;

        if (!token || !userIdStr || Number.isNaN(userIdNum)) {
            alert("Please log in before purchasing.");
            router.replace("/booking-summary?requireLogin=1");
            return;
        }

        if (!API_BASE) {
            alert("API base URL is not configured.");
            return;
        }

        setPlacing(true);

        try {
            const showIdNum = Number(booking.showId);
            if (Number.isNaN(showIdNum)) throw new Error("Invalid show ID.");

            const seatRes = await fetch(
                `${API_BASE}/seats/show/${encodeURIComponent(showIdNum)}/available`,
                { cache: "no-store" }
            );

            if (!seatRes.ok) {
                const text = await seatRes.text();
                throw new Error(text || "Unable to load available seats.");
            }

            type SeatResponse = { seats_id: number; seat_no: number; row_no: string };
            const available: SeatResponse[] = await seatRes.json();
            const seatMap = new Map<string, number>();

            for (const seat of available) {
                const key = `${String(seat.row_no).toUpperCase()}${seat.seat_no}`;
                seatMap.set(key, seat.seats_id);
            }

            const seatIds: number[] = [];

            for (const label of seats) {
                const cleaned = label.trim().toUpperCase();
                const match = cleaned.match(/^([A-Z]+)(\d+)$/);
                if (!match) throw new Error(`Seat ${label} is invalid.`);

                const key = `${match[1]}${parseInt(match[2], 10)}`;
                const seatId = seatMap.get(key);
                if (!seatId) {
                    throw new Error(`Seat ${label} is no longer available.`);
                }
                seatIds.push(seatId);
            }

            let cardIdToUse = selectedCardId;

            if (paymentOption === "new") {
                const number = newCardNumber.trim();
                const exp = newCardExp.trim();
                const cvc = newCardCvc.trim();
                const street = billingStreet.trim();
                const city = billingCity.trim();
                const stateVal = billingState.trim();
                const zip = billingZip.trim();

                if (!number || !exp || !cvc) {
                    throw new Error("Please enter card number, expiration, and CVV.");
                }
                if (!userHasAddress && (!street || !city || !stateVal || !zip)) {
                    throw new Error("Please enter the full billing address.");
                }

                const createBody: any = {
                    number,
                    exp_date: exp,
                    cvc,
                    customer_id: userIdNum,
                };
                if (!userHasAddress) {
                    createBody.address = {
                        street,
                        city,
                        state: stateVal,
                        zip,
                    };
                }

                const createRes = await fetch(`${API_BASE}/cards`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(createBody),
                });

                if (!createRes.ok) {
                    const text = await createRes.text();
                    throw new Error(text || "Failed to add card.");
                }

                const newCard = await createRes.json();
                cardIdToUse = newCard.card_id;
                setSelectedCardId(cardIdToUse);
                if (!userHasAddress && createBody.address) {
                    setUserHasAddress(true);
                }

                setCards((prev) => {
                    const updated = [
                        ...prev,
                        {
                            card_id: newCard.card_id,
                            label: `Card •••• ${String(newCard.number).slice(-4)}`,
                            detail: `Expires ${new Date(newCard.exp_date).toLocaleDateString("en-US", {
                                month: "2-digit",
                                year: "2-digit",
                            })}`,
                        },
                    ];
                    return updated;
                });
            } else if (!cardIdToUse) {
                alert("Please choose a payment method.");
                return;
            }

            // create booking, reserve seats, and queue email in one call
            const checkoutRes = await fetch(`${API_BASE}/booking/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_id: userIdNum,
                    show_id: showIdNum,
                    seat_ids: seatIds,
                    total_amount: finalTotal,
                    creditcard: cardIdToUse,
                }),
            });

            if (!checkoutRes.ok) {
                const text = await checkoutRes.text();
                throw new Error(text || "Failed to place order.");
            }

            // Save booking summary for order confirmation
            localStorage.setItem(
                "booking_summary",
                JSON.stringify({
                    ...booking,
                    discountedTotal: finalTotal,
                    promoUsed: appliedCode || promo?.code || null,
                    seats,
                    baseTotal,
                    discount,
                })
            );

            // Redirect to order confirmation page
            router.push("/order-confirmation");
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to place order.";
            alert(message);
        } finally {
            setPlacing(false);
        }
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

            {/* TWO COLUMNS */}
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
                {/* LEFT — ORDER SUMMARY */}
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
                        <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>
                            Order Summary
                        </h2>
                        <p><strong>Movie:</strong> {booking?.movie}</p>
                        <p><strong>Date:</strong> {datePretty}</p>
                        <p><strong>Showtime:</strong> {timePretty}</p>
                        <p><strong>Tickets:</strong> {totalTickets}</p>
                        <p><strong>Showroom:</strong> {booking?.showroom}</p>
                        <p><strong>Seat(s):</strong> {seats.join(", ")}</p>

                        <hr style={{ margin: "10px 0" }} />

                        <p style={{ display: "flex", justifyContent: "space-between" }}>
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
                    </div>
                </div>

                {/* RIGHT — PROMO + PAYMENT */}
                <div style={{ flex: 1, minWidth: "300px" }}>
                    {/* PROMO */}
                    <div
                        style={{
                            backgroundColor: "#f9f9f9",
                            padding: "20px",
                            borderRadius: "10px",
                            border: "1px solid #ccc",
                            marginBottom: "20px",
                        }}
                    >
                        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                            Promo Code
                        </h3>

                        <div style={{ display: "flex", gap: "8px" }}>
                            <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
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

                        {appliedCode && !promoError && !promo && (
                            <p style={{ color: "green", marginTop: "5px" }}>
                                Promo {appliedCode} applied!
                            </p>
                        )}
                    </div>

                    {/* PAYMENT */}
                    <div
                        style={{
                            backgroundColor: "#f9f9f9",
                            padding: "20px",
                            borderRadius: "10px",
                            border: "1px solid #ccc",
                        }}
                    >
                        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
                            Payment Method
                        </h3>

                        {cards.length === 0 ? (
                            <p style={{ color: "#555", fontSize: "14px", marginBottom: "8px" }}>
                                No saved cards found.
                            </p>
                        ) : (
                            cards.map((m) => (
                                <label
                                    key={m.card_id}
                                    style={{
                                        display: "flex",
                                        padding: "8px",
                        border:
                            paymentOption === "saved1" && selectedCardId === m.card_id
                                ? "2px solid #000"
                                : "1px solid #ddd",
                                        borderRadius: "8px",
                                        marginBottom: "6px",
                                        cursor: "pointer",
                                        gap: "8px",
                                    }}
                                >
                                    <input
                                        type="radio"
                                        checked={paymentOption === "saved1" && selectedCardId === m.card_id}
                                        onChange={() => {
                                            setPaymentOption("saved1");
                                            setSelectedCardId(m.card_id);
                                        }}
                                    />
                                    <div>
                                        <div>{m.label}</div>
                                        <div style={{ fontSize: "12px" }}>{m.detail}</div>
                                    </div>
                                </label>
                            ))
                        )}

                        {/* NEW CARD */}
                        <label
                            style={{
                                display: "flex",
                                padding: "8px",
                                border:
                                    paymentOption === "new"
                                        ? "2px solid #000"
                                        : "1px solid #ddd",
                                borderRadius: "8px",
                                cursor: "pointer",
                                gap: "8px",
                            }}
                        >
                            <input
                                type="radio"
                                checked={paymentOption === "new"}
                                onChange={() => {
                                    setPaymentOption("new");
                                    setSelectedCardId(null);
                                }}
                            />
                            Use a new card
                        </label>

                        {paymentOption === "new" && (
                            <div style={{ marginTop: "10px" }}>
                                <input
                                    type="text"
                                    placeholder="Name on card"
                                    value={newCardName}
                                    onChange={(e) => setNewCardName(e.target.value)}
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
                                    value={newCardNumber}
                                    onChange={(e) => setNewCardNumber(e.target.value)}
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
                                        placeholder="MM/YYYY"
                                        value={newCardExp}
                                        onChange={(e) => setNewCardExp(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: "8px",
                                            borderRadius: "6px",
                                            border: "1px solid #ccc",
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="CVV"
                                        value={newCardCvc}
                                        onChange={(e) => setNewCardCvc(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: "8px",
                                            borderRadius: "6px",
                                            border: "1px solid #ccc",
                                        }}
                                    />
                                </div>
                                {userHasAddress ? (
                                    <p style={{ marginTop: "10px", fontSize: "13px", color: "#444" }}>
                                        Using your saved billing address for this card.
                                    </p>
                                ) : (
                                    <div style={{ marginTop: "10px" }}>
                                        <input
                                            type="text"
                                            placeholder="Billing street"
                                            value={billingStreet}
                                            onChange={(e) => setBillingStreet(e.target.value)}
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
                                            placeholder="City"
                                            value={billingCity}
                                            onChange={(e) => setBillingCity(e.target.value)}
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
                                                placeholder="State"
                                                value={billingState}
                                                onChange={(e) => setBillingState(e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: "8px",
                                                    borderRadius: "6px",
                                                    border: "1px solid #ccc",
                                                }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="ZIP"
                                                value={billingZip}
                                                onChange={(e) => setBillingZip(e.target.value)}
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
                            </div>
                        )}
                    </div>

                    {/* PLACE ORDER BUTTON */}
                    <button
                        onClick={placeOrder}
                        disabled={placing}
                        style={{
                            marginTop: "20px",
                            width: "100%",
                            padding: "14px",
                            backgroundColor: "#000",
                            color: "white",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            opacity: placing ? 0.6 : 1,
                        }}
                    >
                        {placing ? "Placing Order..." : "Place Order"}
                    </button>
                </div>
            </div>
        </div>
    );
}
