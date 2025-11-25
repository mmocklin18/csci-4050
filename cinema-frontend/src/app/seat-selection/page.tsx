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

const seatLayout: { row: string; max: number; seats: number[] }[] = [
    // Back rows (top)
    { row: "H", max: 18, seats: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
    { row: "G", max: 18, seats: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
    { row: "F", max: 18, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
    { row: "E", max: 18, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
    { row: "D", max: 18, seats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
    // Front rows with middle gap
    { row: "C", max: 18, seats: [1, 2, 3, 4, 5, 6, 7, 12, 13, 14, 15, 16, 17, 18] },
    { row: "B", max: 18, seats: [1, 2, 3, 4, 5, 6, 7, 12, 13, 14, 15, 16, 17, 18] },
    { row: "A", max: 18, seats: [1, 2, 3, 4, 5, 6, 7, 12, 13, 14, 15, 16, 17, 18] },
];

// Example unavailable seats (replace with API data later)
const unavailableSeats: string[] = ["E7", "C5", "B14"];

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
                setBooking(JSON.parse(stored));
            } catch {
                // ignore parse errors
            }
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
                Seat Selection
            </h1>

            {/* Booking info summary */}
            <div
                style={{
                    backgroundColor: "#f6f6f6",
                    padding: "16px 22px",
                    borderRadius: "12px",
                    border: "2px solid #000",
                    width: "90%",
                    maxWidth: "350px",
                    margin: "0 auto 20px",
                    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.18)",
                    textAlign: "center",
                    lineHeight: "1.5",
                }}
            >
                <p style={{ margin: "0 0 6px", fontSize: "15px", color: "#222" }}>
                    <strong>Movie:</strong> {booking?.movie || "Not specified"}
                </p>

                <p style={{ margin: "0 0 6px", fontSize: "15px", color: "#222" }}>
                    <strong>Showtime:</strong> {booking?.showtime || "Not specified"}
                </p>

                <p style={{ margin: "0 0 10px", fontSize: "15px", color: "#222" }}>
                    <strong>Date:</strong> {booking?.date || "Not specified"}
                </p>

                {typeof totalTickets !== "undefined" && (
                    <p style={{ margin: 0, fontSize: "15px", color: "#222", textAlign: "center" }}>
                        <strong>Total Tickets:</strong> {totalTickets}
                    </p>
                )}
            </div>


            {/* Seat map container */}
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
                    {/* Rows */}
                    {seatLayout.map(({ row, max, seats }) => (
                        <div
                            key={row}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "6px",
                            }}
                        >
                            {/* Left row label */}
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
                            <div
                                style={{
                                    display: "flex",
                                    gap: "4px",
                                }}
                            >
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
                                    const isUnavailable = unavailableSeats.includes(seatId);
                                    const isSelected = selectedSeats.includes(seatId);

                                    let bg = "transparent";
                                    let textColor = "#fff";
                                    let displayText: string | number = seatNumber;

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
                                                fontSize: "11px",
                                                cursor: isUnavailable
                                                    ? "not-allowed"
                                                    : "pointer",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            {displayText}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Right row label */}
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

                    {/* Stage bar */}
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
                        SCREEN
                    </div>
                </div>
            </div>

            {/* Selection summary + legend + button */}
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

                <div
                    style={{
                        display: "flex",
                        gap: "16px",
                        fontSize: "12px",
                        color: "#333",
                        marginBottom: "12px",
                    }}
                >
                    <span>
                        <span
                            style={{
                                display: "inline-block",
                                width: "14px",
                                height: "14px",
                                borderRadius: "3px",
                                border: "1px solid #000",
                                marginRight: "4px",
                                backgroundColor: "#fff",
                            }}
                        />{" "}
                        Selected
                    </span>
                    <span>
                        <span
                            style={{
                                display: "inline-block",
                                width: "14px",
                                height: "14px",
                                borderRadius: "3px",
                                border: "1px solid #000",
                                marginRight: "4px",
                                backgroundColor: "#000",
                            }}
                        />{" "}
                        Available
                    </span>
                    <span>
                        <span
                            style={{
                                display: "inline-block",
                                width: "14px",
                                height: "14px",
                                borderRadius: "3px",
                                border: "1px solid #000",
                                marginRight: "4px",
                                backgroundColor: "#555",
                            }}
                        />{" "}
                        Unavailable
                    </span>
                </div>

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
                    Continue
                </button>
            </div>
        </div>
    );
}
