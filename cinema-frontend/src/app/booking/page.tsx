"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Booking() {
    const params = useSearchParams();
    const showtimeIso = params.get("time");
    const showId = params.get("showId");
    const derivedDate = extractDatePart(showtimeIso) || params.get("date");
    const showtimeLabel = useMemo(() => formatShowtimeLabel(showtimeIso), [showtimeIso]);
    // Ticket counts per type
    const [adultTickets, setAdultTickets] = useState(0);
    const [childTickets, setChildTickets] = useState(0);
    const [seniorTickets, setSeniorTickets] = useState(0);
    const movieTitle = params.get("title");
    const showtime = params.get("time");
    const [selectedDate, setSelectedDate] = useState("");

    

    useEffect(() => {
        // Try to get the date from localStorage
        const storedDate = derivedDate || localStorage.getItem("selectedDate");
        if (storedDate) {
            setSelectedDate(storedDate);
        }

        // Load ticket counts (if previously saved)
        const a = localStorage.getItem("tickets_adult");
        const c = localStorage.getItem("tickets_child");
        const s = localStorage.getItem("tickets_senior");
        if (a !== null) setAdultTickets(parseInt(a, 10) || 0);
        if (c !== null) setChildTickets(parseInt(c, 10) || 0);
        if (s !== null) setSeniorTickets(parseInt(s, 10) || 0);
    }, []);

    // Persist ticket counts whenever they change
    useEffect(() => {
        localStorage.setItem("tickets_adult", String(adultTickets));
    }, [adultTickets]);
    useEffect(() => {
        localStorage.setItem("tickets_child", String(childTickets));
    }, [childTickets]);
    useEffect(() => {
        localStorage.setItem("tickets_senior", String(seniorTickets));
    }, [seniorTickets]);

    // Ticket controls per type. Adults minimum 0 (can be 0), others minimum 0.
    const increaseAdult = () => setAdultTickets((t) => t + 1);
    const decreaseAdult = () => setAdultTickets((t) => (t > 0 ? t - 1 : 0));

    const increaseChild = () => setChildTickets((t) => t + 1);
    const decreaseChild = () => setChildTickets((t) => (t > 0 ? t - 1 : 0));

    const increaseSenior = () => setSeniorTickets((t) => t + 1);
    const decreaseSenior = () => setSeniorTickets((t) => (t > 0 ? t - 1 : 0));

    // Price points (change as needed)
    const ADULT_PRICE = 12.0; // $12.00
    const CHILD_PRICE = 8.0;  // $8.00
    const SENIOR_PRICE = 9.0; // $9.00

    const adultSubtotal = adultTickets * ADULT_PRICE;
    const childSubtotal = childTickets * CHILD_PRICE;
    const seniorSubtotal = seniorTickets * SENIOR_PRICE;
    const totalPrice = adultSubtotal + childSubtotal + seniorSubtotal;

    return (
        <div style={{ backgroundColor: "#fff", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, margin: 0}}>
            <Navbar/>
            <h1 style={{marginTop: "30px", fontSize: "24px", fontWeight: "bold", color: "black", marginBottom: "16px", marginLeft: "auto", marginRight: "auto", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
                Booking 
            </h1>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                {/*Booking details*/}
                <p style={{marginBottom: "8px", color: "black"}}>
                    <strong>Movie:</strong> {movieTitle || "Not specified"} 
                </p>

                <p style={{marginBottom: "8px", color: "black"}}>
                    <strong>Showtime:</strong> {showtimeLabel || "Not specified"} 
                </p>

                <p style={{marginBottom: "8px", color: "black"}}>
                    <strong>Date:</strong> {selectedDate || "Not specified"}
                </p>
                {showId && (
                    <p style={{marginBottom: "8px", color: "black"}}>
                        <strong>Show ID:</strong> {showId}
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
                    <h2 style={{ fontSize: "15px", fontWeight: "bold", color: "black", marginBottom: "8px" }}>Select Number of Tickets</h2>

                    {/* Adult */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", width: "100%", justifyContent: "space-between", padding: "0 12px" }}>
                        <div style={{ minWidth: "140px", textAlign: "left" }}>
                            <strong>Adults</strong>
                            <div style={{ fontSize: "12px", color: "#555" }}>${ADULT_PRICE.toFixed(2)} each</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <button onClick={decreaseAdult} style={{ width: "28px", height: "28px", fontSize: "16px", fontWeight: "bold", backgroundColor: "#000000ff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>-</button>
                            <span style={{ margin: "0 10px", fontSize: "16px", fontWeight: "bold", color: "black" }}>{adultTickets}</span>
                            <button onClick={increaseAdult} style={{ width: "28px", height: "28px", fontSize: "16px", fontWeight: "bold", backgroundColor: "#000000ff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>+</button>
                        </div>
                        <div style={{ marginLeft: "12px", fontSize: "14px", color: "black" }}>${adultSubtotal.toFixed(2)}</div>
                    </div>

                    {/* Child */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", width: "100%", justifyContent: "space-between", padding: "0 12px" }}>
                        <div style={{ minWidth: "140px", textAlign: "left" }}>
                            <strong>Children</strong>
                            <div style={{ fontSize: "12px", color: "#555" }}>${CHILD_PRICE.toFixed(2)} each</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <button onClick={decreaseChild} style={{ width: "28px", height: "28px", fontSize: "16px", fontWeight: "bold", backgroundColor: "#000000ff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>-</button>
                            <span style={{ margin: "0 10px", fontSize: "16px", fontWeight: "bold", color: "black" }}>{childTickets}</span>
                            <button onClick={increaseChild} style={{ width: "28px", height: "28px", fontSize: "16px", fontWeight: "bold", backgroundColor: "#000000ff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>+</button>
                        </div>
                        <div style={{ marginLeft: "12px", fontSize: "14px", color: "black" }}>${childSubtotal.toFixed(2)}</div>
                    </div>

                    {/* Senior */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", width: "100%", justifyContent: "space-between", padding: "0 12px" }}>
                        <div style={{ minWidth: "140px", textAlign: "left" }}>
                            <strong>Seniors</strong>
                            <div style={{ fontSize: "12px", color: "#555" }}>${SENIOR_PRICE.toFixed(2)} each</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <button onClick={decreaseSenior} style={{ width: "28px", height: "28px", fontSize: "16px", fontWeight: "bold", backgroundColor: "#000000ff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>-</button>
                            <span style={{ margin: "0 10px", fontSize: "16px", fontWeight: "bold", color: "black" }}>{seniorTickets}</span>
                            <button onClick={increaseSenior} style={{ width: "28px", height: "28px", fontSize: "16px", fontWeight: "bold", backgroundColor: "#000000ff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>+</button>
                        </div>
                        <div style={{ marginLeft: "12px", fontSize: "14px", color: "black" }}>${seniorSubtotal.toFixed(2)}</div>
                    </div>

                    <div style={{ width: "100%", height: "1px", backgroundColor: "#eee", margin: "8px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "0 12px", alignItems: "center" }}>
                        <div style={{ fontWeight: "bold" }}>Total</div>
                        <div style={{ fontWeight: "bold" }}>${totalPrice.toFixed(2)}</div>
                    </div>
                </div>
                {/*Confirm booking button*/}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "32px" }}>
                    <button
                        style={{
                            marginTop: "20px",
                            //marginLeft: "20px",
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
                                date: selectedDate || null,
                                tickets: {
                                    adults: adultTickets,
                                    children: childTickets,
                                    seniors: seniorTickets,
                                },
                                total: totalPrice,
                            };
                            // Save summary to localStorage and show confirmation
                            localStorage.setItem("booking_summary", JSON.stringify(summary));
                            alert(`Booking saved. Total: $${totalPrice.toFixed(2)} (${adultTickets} adult, ${childTickets} child, ${seniorTickets} senior)`);
                        }}
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
}
