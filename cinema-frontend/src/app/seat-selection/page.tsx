"use client";

import React, { useEffect, useState } from "react";
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

type SeatLayoutRow = { row: string; max: number; seats: number[] };
type TheaterKey = "theater1" | "theater2" | "theater3";

//helpers to format date/time like on Booking page
const getDateOnly = (value: string | null | undefined): string => {
    if (!value) return "";
    const v = value.trim();
    if (v.includes("T")) return v.split("T")[0];
    if (v.includes(" ")) return v.split(" ")[0];
    return v;
};

const getTimeOnly = (value: string | null | undefined): string => {
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


const THEATER_LAYOUTS: Record<
    TheaterKey,
    { layout: SeatLayoutRow[]; unavailableSeats: string[] }
> = {
    theater1: {
        layout: [
            { row: "H", max: 18, seats: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
            { row: "G", max: 18, seats: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
            { row: "F", max: 18, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
            { row: "E", max: 18, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
            { row: "D", max: 18, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
            { row: "C", max: 18, seats: [1, 2, 3, 4, 5, 6, 7, 12, 13, 14, 15, 16, 17, 18] },
            { row: "B", max: 18, seats: [1, 2, 3, 4, 5, 6, 7, 12, 13, 14, 15, 16, 17, 18] },
            { row: "A", max: 18, seats: [1, 2, 3, 4, 5, 6, 7, 12, 13, 14, 15, 16, 17, 18] },
        ],
        unavailableSeats: ["E7", "C5", "B14"],
    },
    theater2: {
        layout: [
            { row: "F", max: 12, seats: [3, 4, 5, 6, 7, 8, 9, 10] },
            { row: "E", max: 12, seats: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
            { row: "D", max: 12, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
            { row: "C", max: 12, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
            { row: "B", max: 12, seats: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
            { row: "A", max: 12, seats: [3, 4, 5, 6, 7, 8, 9, 10] },
        ],
        unavailableSeats: ["D6", "D7", "C3", "A5"],
    },
    theater3: {
        layout: [
            { row: "D", max: 10, seats: [2, 3, 4, 5, 6, 7, 8, 9] },
            { row: "C", max: 10, seats: [2, 3, 4, 5, 6, 7, 8, 9] },
            { row: "B", max: 10, seats: [2, 3, 4, 5, 6, 7, 8, 9] },
            { row: "A", max: 10, seats: [3, 4, 5, 6, 7, 8] },
        ],
        unavailableSeats: ["C4", "B7"],
    },
};

const showroomToKey: Record<string, TheaterKey> = {
    "1": "theater1",
    "2": "theater2",
    "3": "theater3",
};

export default function SeatSelectionPage() {
    const [booking, setBooking] = useState<BookingSummary | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [currentTheaterKey, setCurrentTheaterKey] =
        useState<TheaterKey | null>(null);
    const [fetchedUnavailable, setFetchedUnavailable] = useState<string[] | null>(
        null
    );

    useEffect(() => {
        const stored = localStorage.getItem("booking_summary");
        if (stored) {
            try {
                const parsed: BookingSummary = JSON.parse(stored);
                setBooking(parsed);

                let key: TheaterKey = "theater1"; // fallback
                if (parsed.showroom) {
                    const fromShowroom = showroomToKey[parsed.showroom];
                    if (fromShowroom) {
                        key = fromShowroom;
                    }
                }
                setCurrentTheaterKey(key);
            } catch (err) {
                console.error("Error parsing booking_summary", err);
            }
        } else {
            // no booking summary, still avoid null
            setCurrentTheaterKey("theater1");
        }
    }, []);

    useEffect(() => {
        if (!booking?.showId || !currentTheaterKey || !API_BASE) return;

        const showIdNum = Number(booking.showId);
        if (Number.isNaN(showIdNum)) return;

        const controller = new AbortController();

        type SeatResponse = { seats_id: number; seat_no: number; row_no: string };

        const fetchUnavailable = async () => {
            try {
                const res = await fetch(
                    `${API_BASE}/seats/show/${encodeURIComponent(
                        showIdNum
                    )}/available`,
                    { cache: "no-store", signal: controller.signal }
                );

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || "Failed to load available seats");
                }

                const available: SeatResponse[] = await res.json();
                const availableSet = new Set(
                    available.map(
                        (seat) => `${String(seat.row_no).toUpperCase()}${seat.seat_no}`
                    )
                );

                const layout = THEATER_LAYOUTS[currentTheaterKey].layout;
                const taken: string[] = [];

                for (const { row, seats } of layout) {
                    for (const seatNum of seats) {
                        const label = `${row}${seatNum}`;
                        if (!availableSet.has(label)) {
                            taken.push(label);
                        }
                    }
                }

                setFetchedUnavailable(taken);
            } catch (err) {
                console.error("Error loading seats for show", err);
                setFetchedUnavailable(null);
            }
        };

        fetchUnavailable();

        return () => controller.abort();
    }, [booking?.showId, currentTheaterKey]);

    if (!booking || !currentTheaterKey) {
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
                        marginBottom: "10px",
                        textAlign: "center",
                    }}
                >
                    Seat Selection
                </h1>
                <p
                    style={{
                        textAlign: "center",
                        marginTop: "16px",
                        color: "#555",
                    }}
                >
                    Loading seats…
                </p>
            </div>
        );
    }

    const activeTheater = THEATER_LAYOUTS[currentTheaterKey];
    const seatLayout = activeTheater.layout;
    const unavailableSeats = fetchedUnavailable ?? activeTheater.unavailableSeats;

    const totalTickets =
        booking
            ? booking.tickets.adults +
            booking.tickets.children +
            booking.tickets.seniors
            : 0;

    const toggleSeat = (seatId: string) => {
        if (unavailableSeats.includes(seatId)) return;

        const isSelected = selectedSeats.includes(seatId);

        if (!isSelected && totalTickets > 0 && selectedSeats.length >= totalTickets) {
            alert(`You can select up to ${totalTickets} seats.`);
            return;
        }

        setSelectedSeats((prev) =>
            isSelected ? prev.filter((s) => s !== seatId) : [...prev, seatId]
        );
    };

    const handleConfirmSeats = () => {
        if (totalTickets > 0 && selectedSeats.length !== totalTickets) {
            alert(
                `Please select exactly ${totalTickets} seats. You currently have ${selectedSeats.length}.`
            );
            return;
        }

        localStorage.setItem("selected_seats", JSON.stringify(selectedSeats));

        window.location.href = "/booking-summary";
    };

    // formatted date/time for display
    const formattedShowtime = getTimeOnly(booking?.showtime);
    const formattedDate = getDateOnly(booking?.date);

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
                    marginBottom: "10px",
                    textAlign: "center",
                }}
            >
                Seat Selection
            </h1>

            {/* Booking info + showroom */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: "10px",
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
                        margin: "0 auto 8px",
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

                    <div style={{ fontSize: "16px" }}>
                        <strong>Date:</strong>{" "}
                        {formatPrettyDate(booking?.date) || "Not specified"}
                    </div>

                    <div style={{ fontSize: "16px" }}>
                        <strong>Showroom:</strong>{" "}
                        {booking?.showroom ?? "Not specified"}
                    </div>
                </div>
            </div>

            {/* Seat map */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "0 16px 32px",
                }}
            >
                <div
                    style={{
                        backgroundColor: "#000",
                        padding: "20px 28px",
                        borderRadius: "12px",
                        display: "inline-block",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
                    }}
                >
                    {seatLayout.map(({ row, max, seats }) => (
                        <div
                            key={row}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "6px",
                            }}
                        >
                            <div
                                style={{
                                    width: "20px",
                                    color: "#fff",
                                    fontSize: "12px",
                                    textAlign: "center",
                                    marginRight: "8px",
                                }}
                            >
                                {row}
                            </div>

                            {/* Seats */}
                            <div style={{ display: "flex", gap: "4px" }}>
                                {Array.from({ length: max }, (_, i) => {
                                    const seatNumber = i + 1;
                                    const hasSeat = seats.includes(seatNumber);

                                    if (!hasSeat) {
                                        return (
                                            <div
                                                key={`${row}-${seatNumber}`}
                                                style={{
                                                    width: "26px",
                                                    height: "26px",
                                                    margin: "1px",
                                                    visibility: "hidden",
                                                }}
                                            />
                                        );
                                    }

                                    const seatId = `${row}${seatNumber}`;
                                    const isUnavailable =
                                        unavailableSeats.includes(seatId);
                                    const isSelected =
                                        selectedSeats.includes(seatId);

                                    let bg = "transparent";
                                    let textColor = "#fff";
                                    let displayText: string | number =
                                        seatNumber;

                                    // Unavailable -> red X
                                    if (isUnavailable) {
                                        bg = "red";
                                        textColor = "white";
                                        displayText = "X";
                                    } else if (isSelected) {
                                        bg = "white";
                                        textColor = "black";
                                    }

                                    return (
                                        <button
                                            key={seatId}
                                            onClick={() => toggleSeat(seatId)}
                                            disabled={isUnavailable}
                                            style={{
                                                width: "26px",
                                                height: "26px",
                                                margin: "1px",
                                                borderRadius: "4px",
                                                border: "1px solid #fff",
                                                backgroundColor: bg,
                                                color: textColor,
                                                fontSize: isUnavailable
                                                    ? "14px"
                                                    : "11px",
                                                cursor: isUnavailable
                                                    ? "not-allowed"
                                                    : "pointer",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                fontWeight: isUnavailable
                                                    ? "bold"
                                                    : "normal",
                                            }}
                                        >
                                            {displayText}
                                        </button>
                                    );
                                })}
                            </div>


                            <div
                                style={{
                                    width: "20px",
                                    color: "#fff",
                                    fontSize: "12px",
                                    textAlign: "center",
                                    marginLeft: "8px",
                                }}
                            >
                                {row}
                            </div>
                        </div>
                    ))}

                    <div
                        style={{
                            marginTop: "18px",
                            backgroundColor: "#fff",
                            color: "#000",
                            textAlign: "center",
                            padding: "8px 0",
                            borderRadius: "6px",
                            fontWeight: "bold",
                            fontSize: "13px",
                        }}
                    >
                        STAGE
                    </div>
                </div>
            </div>

            {/* Selection summary + button */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: "32px",
                }}
            >
                <p
                    style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "black",
                        marginBottom: "8px",
                    }}
                >
                    Seats selected: {selectedSeats.length}
                    {totalTickets > 0 && ` / ${totalTickets}`}
                </p>

                <button
                    onClick={handleConfirmSeats}
                    style={{
                        padding: "10px 24px",
                        backgroundColor: "#000000ff",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    Continue to Booking Summary
                </button>
            </div>
        </div>
    );
}
