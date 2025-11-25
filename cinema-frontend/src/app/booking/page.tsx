"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

type ApiPrice = {
    type: string;
    amount: number | string;
};


type Prices = {
    adult: number;
    child: number;
    senior: number;
};

export default function Booking() {
    const params = useSearchParams();
    const [adultTickets, setAdultTickets] = useState(0);
    const [childTickets, setChildTickets] = useState(0);
    const [seniorTickets, setSeniorTickets] = useState(0);

    const movieTitle = params.get("title");
    const showtime = params.get("time"); // may contain date+time
    const showId = params.get("showId");
    const showroomParam =
        params.get("showroom") || params.get("showroom_id") || null;

    const [selectedDate, setSelectedDate] = useState("");
    const [prices, setPrices] = useState<Prices | null>(null);
    const [pricesLoading, setPricesLoading] = useState(true);
    const [pricesError, setPricesError] = useState<string | null>(null);

    const increaseAdult = () => setAdultTickets((t) => t + 1);
    const decreaseAdult = () => setAdultTickets((t) => (t > 0 ? t - 1 : 0));

    const increaseChild = () => setChildTickets((t) => t + 1);
    const decreaseChild = () => setChildTickets((t) => (t > 0 ? t - 1 : 0));

    const increaseSenior = () => setSeniorTickets((t) => t + 1);
    const decreaseSenior = () => setSeniorTickets((t) => (t > 0 ? t - 1 : 0));



    const getDateOnly = (value: string | null) => {
        if (!value) return "";
        const v = value.trim();
        if (v.includes("T")) return v.split("T")[0];
        if (v.includes(" ")) return v.split(" ")[0];
        return v;
    };

    const getTimeOnly = (value: string | null) => {
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

    const formattedShowtime = getTimeOnly(showtime);
    const formattedDate = getDateOnly(selectedDate || showtime || null);


    useEffect(() => {
        const storedDate = localStorage.getItem("selectedDate");
        if (storedDate) {
            setSelectedDate(storedDate);
            localStorage.setItem("selectedDate", storedDate);
        }

        const a = localStorage.getItem("tickets_adult");
        const c = localStorage.getItem("tickets_child");
        const s = localStorage.getItem("tickets_senior");
        if (a !== null) setAdultTickets(parseInt(a, 10) || 0);
        if (c !== null) setChildTickets(parseInt(c, 10) || 0);
        if (s !== null) setSeniorTickets(parseInt(s, 10) || 0);
    }, []);


    useEffect(() => {
        localStorage.setItem("tickets_adult", String(adultTickets));
    }, [adultTickets]);
    useEffect(() => {
        localStorage.setItem("tickets_child", String(childTickets));
    }, [childTickets]);
    useEffect(() => {
        localStorage.setItem("tickets_senior", String(seniorTickets));
    }, [seniorTickets]);


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
                    const key = row.type.toLowerCase().trim();
                    const amountNum =
                        typeof row.amount === "string"
                            ? parseFloat(row.amount)
                            : row.amount;

                    if (!Number.isFinite(amountNum)) continue;

                    if (key === "adult") normalized.adult = amountNum;
                    if (key === "child") normalized.child = amountNum;
                    if (key === "senior") normalized.senior = amountNum;
                }

                setPrices(normalized);
            } catch (err: unknown) {
                if (!alive) return;
                setPricesError(
                    err instanceof Error ? err.message : "Failed to load prices"
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

    const adultSubtotal = adultTickets * ADULT_PRICE;
    const childSubtotal = childTickets * CHILD_PRICE;
    const seniorSubtotal = seniorTickets * SENIOR_PRICE;
    const totalPrice = adultSubtotal + childSubtotal + seniorSubtotal;

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
                    marginLeft: "auto",
                    marginRight: "auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                }}
            >
                Booking
            </h1>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >

                <div
                    style={{
                        backgroundColor: "#f6f6f6",
                        padding: "18px 24px",
                        borderRadius: "14px",
                        border: "2px solid #000",
                        width: "90%",
                        maxWidth: "380px",
                        margin: "0 auto 20px",
                        boxShadow: "0 6px 18px rgba(0, 0, 0, 0.18)",
                        textAlign: "center",
                        lineHeight: "1.6",
                    }}
                >
                    <div style={{ fontSize: "16px", marginBottom: "6px" }}>
                        <strong>Movie:</strong>{" "}
                        {movieTitle || "Not specified"}
                    </div>

                    <div style={{ fontSize: "16px", marginBottom: "6px" }}>
                        <strong>Showtime:</strong>{" "}
                        {formattedShowtime || "Not specified"}
                    </div>

                    <div style={{ fontSize: "16px" }}>
                        <strong>Date:</strong>{" "}
                        {formatPrettyDate(selectedDate) || "Not specified"}
                    </div>

                    <div style={{ fontSize: "16px" }}>
                        <strong>Showroom:</strong>{" "}
                        {showroomParam || "Not specified"}
                    </div>
                </div>

                {/* Optional: show price loading / error */}
                {pricesLoading && (
                    <p style={{ color: "#555", marginBottom: "8px" }}>
                        Loading ticket prices…
                    </p>
                )}
                {pricesError && (
                    <p style={{ color: "#b91c1c", marginBottom: "8px" }}>
                        Could not load prices. Using $0.00 defaults.
                    </p>
                )}

                {/* Ticket counters */}
                <div
                    style={{
                        marginTop: "8px",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        textAlign: "center",
                        backgroundColor: "#f9f9f9",
                        maxWidth: "420px",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "15px",
                            fontWeight: "bold",
                            color: "black",
                            marginBottom: "8px",
                        }}
                    >
                        Select Number of Tickets
                    </h2>

                    {/* Adult */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "8px",
                            width: "100%",
                            justifyContent: "space-between",
                            padding: "0 12px",
                        }}
                    >
                        <div style={{ minWidth: "140px", textAlign: "left" }}>
                            <strong>Adults</strong>
                            <div style={{ fontSize: "12px", color: "#555" }}>
                                ${ADULT_PRICE.toFixed(2)} each
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <button
                                onClick={decreaseAdult}
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    backgroundColor: "#000000ff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                -
                            </button>
                            <span
                                style={{
                                    margin: "0 10px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    color: "black",
                                }}
                            >
                                {adultTickets}
                            </span>
                            <button
                                onClick={increaseAdult}
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    backgroundColor: "#000000ff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                +
                            </button>
                        </div>
                        <div
                            style={{
                                marginLeft: "12px",
                                fontSize: "14px",
                                color: "black",
                            }}
                        >
                            ${adultSubtotal.toFixed(2)}
                        </div>
                    </div>

                    {/* Child */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "8px",
                            width: "100%",
                            justifyContent: "space-between",
                            padding: "0 12px",
                        }}
                    >
                        <div style={{ minWidth: "140px", textAlign: "left" }}>
                            <strong>Children</strong>
                            <div style={{ fontSize: "12px", color: "#555" }}>
                                ${CHILD_PRICE.toFixed(2)} each
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <button
                                onClick={decreaseChild}
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    backgroundColor: "#000000ff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                -
                            </button>
                            <span
                                style={{
                                    margin: "0 10px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    color: "black",
                                }}
                            >
                                {childTickets}
                            </span>
                            <button
                                onClick={increaseChild}
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    backgroundColor: "#000000ff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                +
                            </button>
                        </div>
                        <div
                            style={{
                                marginLeft: "12px",
                                fontSize: "14px",
                                color: "black",
                            }}
                        >
                            ${childSubtotal.toFixed(2)}
                        </div>
                    </div>

                    {/* Senior */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "8px",
                            width: "100%",
                            justifyContent: "space-between",
                            padding: "0 12px",
                        }}
                    >
                        <div style={{ minWidth: "140px", textAlign: "left" }}>
                            <strong>Seniors</strong>
                            <div style={{ fontSize: "12px", color: "#555" }}>
                                ${SENIOR_PRICE.toFixed(2)} each
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <button
                                onClick={decreaseSenior}
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    backgroundColor: "#000000ff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                -
                            </button>
                            <span
                                style={{
                                    margin: "0 10px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    color: "black",
                                }}
                            >
                                {seniorTickets}
                            </span>
                            <button
                                onClick={increaseSenior}
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    backgroundColor: "#000000ff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                +
                            </button>
                        </div>
                        <div
                            style={{
                                marginLeft: "12px",
                                fontSize: "14px",
                                color: "black",
                            }}
                        >
                            ${seniorSubtotal.toFixed(2)}
                        </div>
                    </div>

                    <div
                        style={{
                            width: "100%",
                            height: "1px",
                            backgroundColor: "#eee",
                            margin: "8px 0",
                        }}
                    />
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                            padding: "0 12px",
                            alignItems: "center",
                        }}
                    >
                        <div style={{ fontWeight: "bold" }}>Total</div>
                        <div style={{ fontWeight: "bold" }}>
                            ${totalPrice.toFixed(2)}
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "32px",
                    }}
                >
                    <button
                        style={{
                            marginTop: "20px",
                            padding: "10px 20px",
                            backgroundColor: "#000000ff",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            justifyContent: "center",
                            alignItems: "center",
                            display: "flex",
                        }}
                        onClick={() => {
                            const summary = {
                                movie: movieTitle || null,
                                showtime: showtime || null,
                                date: formattedDate || null,
                                tickets: {
                                    adults: adultTickets,
                                    children: childTickets,
                                    seniors: seniorTickets,
                                },
                                total: totalPrice,
                                showroom: showroomParam || null,
                                showId: showId || null,
                            };

                            localStorage.setItem(
                                "booking_summary",
                                JSON.stringify(summary)
                            );

                            window.location.href = "/seat-selection";
                        }}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}