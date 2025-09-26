"use client";
import React, { use, useEffect } from "react";
import {useState} from "react";
import { useSearchParams } from "next/navigation";

export default function Booking() {
    const params = useSearchParams();
    const [tickets, setTickets] = useState(1);
    const movieTitle = params.get("title");
    const showtime = params.get("time");
    const [selectedDate, setSelectedDate] = useState("");

    useEffect(() => {
        // Try to get the date from localStorage
        const storedDate = localStorage.getItem("selectedDate");
        if (storedDate) {
            setSelectedDate(storedDate);
        }
    }, []);

    const increaseTicketNum = () => setTickets((t) => t + 1);
    //Cannot go below 1 ticket
    const decreaseTicketNum = () => setTickets((t) => (t > 1 ? t - 1 : 1));

    return (
        <div style={{ backgroundColor: "#fff", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, margin: 0}}>
            <header className="navbar">
                <div className="brand">BookMyShow</div>
            </header>
            <h1 style={{marginTop: "30px", fontSize: "24px", fontWeight: "bold", color: "black", marginBottom: "16px", marginLeft: "auto", marginRight: "auto", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
                Booking 
            </h1>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                {/*Booking details*/}
                <p style={{marginBottom: "8px", color: "black"}}>
                    <strong>Movie:</strong> {movieTitle || "Not specified"} 
                </p>

                <p style={{marginBottom: "8px", color: "black"}}>
                    <strong>Showtime:</strong> {showtime || "Not specified"} 
                </p>

                <p style={{marginBottom: "8px", color: "black"}}>
                    <strong>Date:</strong> {selectedDate || "Not specified"}
                </p>

                {/*Ticket counter*/}
                <div 
                    style={{
                        marginTop: "8px",
                        padding: "4px",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        textAlign: "center",
                        backgroundColor : "#f9f9f9",
                        maxWidth: "220px",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}
                >
                    <h2 style={{ fontSize: "15px", fontWeight: "bold", color: "black", marginBottom: "8px" }}>Select Number of Tickets</h2>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <button
                        onClick={decreaseTicketNum}
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
                    <span style={{ margin: "0 10px", fontSize: "16px", fontWeight: "bold", color: "black" }}>{tickets}</span>
                    <button
                        onClick={increaseTicketNum}
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
                            display: "flex"
                        }}
                        onClick={() => alert("Dummy button clicked!")}
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
}